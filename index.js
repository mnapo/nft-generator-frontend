import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import axios from "axios";
import { NFTStorage, File } from "nft.storage";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

dotenv.config();

const PORT = process.env.PORT || 4000;
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NFT_COLLECTION_ADDRESS = process.env.NFT_COLLECTION_ADDRESS;
const THIRDWEB_NETWORK = process.env.THIRDWEB_NETWORK || "polygon-amoy";

if (!NFT_STORAGE_KEY) {
    console.warn("NFT_STORAGE_KEY undefined");
}
if (!PRIVATE_KEY) {
    console.warn("PRIVATE_KEY undefined");
}

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(cors());
app.use(express.json());

const nftStorage = new NFTStorage({ token: NFT_STORAGE_KEY });
const sdk = PRIVATE_KEY ? ThirdwebSDK.fromPrivateKey(PRIVATE_KEY, THIRDWEB_NETWORK) : null;

async function fetchImageFromUrl(url, destPath) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(destPath, Buffer.from(response.data, "binary"));
}

app.post("/mint", upload.single("file"), async (req, res) => {
  try {
    const { name = "QR NFT", description = "NFT generado desde QR del juego", imageUrl } = req.body;
    let imageCid;
    if (req.file) {
        const data = fs.readFileSync(req.file.path);
        const fileForStore = new File([data], req.file.originalname, { type: req.file.mimetype });
        imageCid = await nftStorage.storeBlob(fileForStore);
        fs.unlinkSync(req.file.path);
    } else if (imageUrl) {
        const tmpPath = `uploads/tmp_${Date.now()}.bin`;
        await fetchImageFromUrl(imageUrl, tmpPath);
        const data = fs.readFileSync(tmpPath);
        const ext = imageUrl.split(".").pop().split(/\#|\?/)[0] || "png";
        const fileForStore = new File([data], `image.${ext}`);
        imageCid = await nftStorage.storeBlob(fileForStore);
        fs.unlinkSync(tmpPath);
    } else {
        return res.status(400).json({ success: false, error: "No image file or imageUrl provided" });
    }

    const imageIpfsUrl = `ipfs://${imageCid}`;

    const metadataObj = {
        name,
        description,
        image: imageIpfsUrl,
        properties: {
            origin: "game-qr",
            createdAt: new Date().toISOString()
        }
    };

    const metadataFile = new File([JSON.stringify(metadataObj)], "metadata.json", { type: "application/json" });
    const metadataCid = await nftStorage.storeBlob(metadataFile);
    const metadataIpfs = `ipfs://${metadataCid}`;

    if (!sdk) {
      return res.json({
        success: true,
        preview: {
            imageIpfsUrl,
            metadataIpfs,
            metadata: metadataObj
        },
        note: "PRIVATE_KEY undefined"
      });
    }

    if (!NFT_COLLECTION_ADDRESS) {
      return res.status(500).json({ success: false, error: "NFT_COLLECTION_ADDRESS undefined" });
    }

    const contract = await sdk.getContract(NFT_COLLECTION_ADDRESS);
    const minterAddress = await sdk.getSigner().getAddress?.() || (await sdk.wallet.getAddress?.());
    const to = req.body.to || minterAddress;
    const tx = await contract.erc721.mintTo(to, {
        name: metadataObj.name,
        description: metadataObj.description,
        image: metadataObj.image
    });

    let tokenId;
    if (tx && tx.id) tokenId = tx.id.toString();
    else if (tx && tx.receipt && tx.receipt.logs) tokenId = "unknown";

    const openseaUrl = `https://testnets.opensea.io/assets/${NFT_COLLECTION_ADDRESS}/${tokenId}`;

    res.json({
        success: true,
        tokenId,
        tx,
        metadataIpfs,
        imageIpfsUrl,
        opensea: openseaUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => res.send("NFT generator server up"));

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
