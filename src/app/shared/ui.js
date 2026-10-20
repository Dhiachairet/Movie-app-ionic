import { photoSer } from "../services/photos.js";

export async function presentToast(msg, color) {
  const toast = document.createElement("ion-toast");
  toast.message = msg;
  toast.duration = 1500;
  toast.position = "bottom";
  toast.color = color;

  document.body.appendChild(toast);
  await toast.present();
}

export async function showAlertError(message, header = "Input error") {
  const alert = document.createElement("ion-alert");
  alert.header = header;
  alert.message = message;
  alert.buttons = [
    {
      text: "OK",
      role: "cancel",
    },
  ];

  document.body.appendChild(alert);
  await alert.present();
}

export async function presentLoading(message) {
  const loading = document.createElement("ion-loading");
  loading.message = message;

  document.body.appendChild(loading);
  await loading.present();
  return loading;
}

// used by the sign-up page and the edit profile page:
// onPhoto is a function that receives the new photo (base64)
export async function presentPhotoActionSheet(onPhoto) {
  const actionSheet = document.createElement("ion-action-sheet");
  actionSheet.header = "Add a photo";
  actionSheet.buttons = [
    {
      text: "Take a photo",
      icon: "camera",
      handler: async () => {
        try {
          onPhoto(await photoSer.takePhoto());
        } catch (error) {
          console.log("Photo cancelled", error);
        }
      },
    },
    {
      text: "Choose from gallery",
      icon: "image",
      handler: async () => {
        try {
          let photo = await photoSer.choosePhoto();
          if (photo) onPhoto(photo);
        } catch (error) {
          console.log("Selection cancelled", error);
        }
      },
    },
    {
      text: "Cancel",
      icon: "close",
      role: "cancel",
    },
  ];

  document.body.appendChild(actionSheet);
  await actionSheet.present();
}
