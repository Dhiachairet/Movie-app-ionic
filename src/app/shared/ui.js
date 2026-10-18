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
