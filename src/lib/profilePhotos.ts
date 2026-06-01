import { ImagePickerAsset } from "expo-image-picker";
import { supabase } from "./supabase";

const PROFILE_PHOTOS_BUCKET = "datez-profile-photos";

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return bytes.buffer;
}

function getFileExtension(asset: ImagePickerAsset) {
  const mimeExtension = asset.mimeType?.split("/")[1];

  if (mimeExtension) {
    return mimeExtension === "jpeg" ? "jpg" : mimeExtension;
  }

  const uriExtension = asset.uri.split(".").pop()?.split("?")[0];

  return uriExtension || "jpg";
}

async function getImageBody(asset: ImagePickerAsset) {
  if (asset.base64) {
    return base64ToArrayBuffer(asset.base64);
  }

  if (asset.file) {
    return asset.file;
  }

  const response = await fetch(asset.uri);
  return response.blob();
}

export async function uploadProfilePhoto(userId: string, asset: ImagePickerAsset, folder: "avatar" | "gallery") {
  const extension = getFileExtension(asset);
  const filePath = `${userId}/${folder}/${Date.now()}.${extension}`;
  const body = await getImageBody(asset);

  const { error } = await supabase.storage.from(PROFILE_PHOTOS_BUCKET).upload(filePath, body, {
    contentType: asset.mimeType ?? "image/jpeg",
    upsert: true
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(filePath);

  return data.publicUrl;
}
