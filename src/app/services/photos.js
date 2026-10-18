import { Camera } from "@capacitor/camera";

class Photos {
  async takePhoto() {
    let result = await Camera.takePhoto({
      quality: 80,
    });
    return await this.compressPhoto(result.webPath);
  }

  async choosePhoto() {
    let result = await Camera.chooseFromGallery({
      allowMultipleSelection: false,
    });
    if (!result.results.length) return null;
    return await this.compressPhoto(result.results[0].webPath);
  }

  // webPath is a temporary address, it cannot be saved in Firestore:
  // we shrink the photo to 300px and convert it into base64 text
  compressPhoto(webPath) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => {
        let ratio = Math.min(1, 300 / Math.max(img.width, img.height));
        let canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = webPath;
    });
  }
}

export const photoSer = new Photos();
