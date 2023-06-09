import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";
import cloudinary from "cloudinary";

const COL = "boats";

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

//* ========= ADD  A BOAT =======
export const addBoat = async (req, res) => {
	console.log(req.file); // get the picture url here
	console.log(req.body); // get rest of form field info here
	req.body.status = "FREE"; // add status
	try {
		cloudinary.v2.uploader
			.upload_stream(
				{
					resource_type: "image",
					folder: "boats",
				},
				async (err, result) => {
					if (err) console.log(err);
					console.log(result); // result from cloudinary upstream should include the following
					const img = {
						url: result.secure_url,
						public_id: result.public_id,
					};
					req.body.img = img;
					const db = await getDB();
					const counter = await db
						.collection("boats_counter")
						.findOneAndUpdate(
							{ _id: "boats_id" },
							{ $inc: { seq: 1 } },
							{ returnOriginal: false }
						);
					const boatID = counter.value.seq;
					console.log("💡 ~ boatID:", boatID);
					req.body.boatID = boatID;
					db.collection(COL).createIndex({ boatID: 1 }, { unique: true });
					await db.collection(COL).insertOne(req.body);
					res.send("Added new boat");
				}
			)
			.end(req.file.buffer);
	} catch (err) {
		console.error(err.message); // log the error message
		res.status(500).end();
	}
	// try {
	// 	req.body.pic = req.file.path;
	// 	req.body.status = "FREE";
	// 	const db = await getDB();
	// 	const length = await db.collection(COL).countDocuments();
	// 	req.body.boatID = length + 1;
	// 	const result = await db.collection(COL).insertOne(req.body);
	// 	res.send("Added Boat");
	// } catch (err) {
	// 	console.error(err.message); // log the error message
	// 	res.status(500).end();
	// }
};

export const getBoats = async (req, res) => {
	try {
		const db = await getDB();
		const result = await db.collection(COL).find().toArray();
		if (result === null) res.end();
		else {
			res.json(result);
		}
	} catch (err) {
		console.error(err.message); // log the error message
		res.status(500).end();
	}
};
export const getBoatCount = async (req, res) => {
	try {
		const db = await getDB();
		const length = await db.collection(COL).countDocuments();
		// console.log(length);
		if (length === null) res.end();
		else {
			res.json(length);
		}
	} catch (err) {
		console.error(err.message); // log the error message
		res.status(500).end();
	}
};

export const getBoat = async (req, res) => {
	try {
		const db = await getDB();
		const result = await db
			.collection(COL)
			.findOne({ _id: new ObjectId(req.params.id) });
		if (result === null) res.end();
		else {
			// console.log(result);
			res.json(result);
		}
	} catch (err) {
		console.error(err.message);
		res.sendStatus(500);
	}
};

export const deleteBoat = async (req, res) => {
	// receive id via req.params.id)
	try {
		const db = await getDB();
		const response = await db
			.collection(COL)
			.findOne({ _id: new ObjectId(req.params.id) });
		cloudinary.v2.uploader.destroy(
			response.img.public_id,
			async (err, result) => {
				if (err) throw err;
				await db
					.collection(COL)
					.deleteOne({ _id: new ObjectId(req.params.id) }, (err, result) => {
						if (err) throw err;
						console.log("DB", result);
					});
			}
		);
		res.json({ message: "Deleted image" });
	} catch (err) {
		console.log(err);
		res.json({ message: "Nah deleting your image did not work" });
	}
};
