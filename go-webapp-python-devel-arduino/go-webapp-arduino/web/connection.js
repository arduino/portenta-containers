
const socket = io.connect(':8000');

socket.on('log', (msg) => console.log(msg))

socket.on('wifi', (msg) => {
    console.log(msg);
    data = JSON.parse(msg);
    if (data.status == 'done') {
      showAlert('doneAlert');
    } else {
      showAlert('errorAlert');
    }
  });

// In this way two connections are established instead of one
//const socket = io('http://localhost:8000/socket.io/');
//socket.on('message', (msg) => console.info(msg));

function sendCredentials(s, p) {
  credentials = { ssid: s, pass: p };

  return fetch('wifi', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
}
