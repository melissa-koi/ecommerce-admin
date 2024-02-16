import multiparty from 'multiparty';
import {mongooseConnect} from "@/lib/mongoose";

export default async function handle(req, res) {

  await mongooseConnect();
  await isAdminRequest(req, res);
  
  const form = new multiparty.Form();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files })
    });
  })

  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY,
  });

  const links = [];
  for (const file of files.file) {
    await cloudinary.uploader
      .upload(file.path)
      .then(result => links.push(result?.url));
  }

  return res.json({links})
}

export const config = {
  api: { bodyParser: false },
}



