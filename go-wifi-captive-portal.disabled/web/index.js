
document.getElementById('ssid').value = 'BCMI';
document.getElementById('password').value = 'ArduinoccRulez';

document.getElementById('doneAlert').style.display = 'none';
document.getElementById('errorAlert').style.display = 'none';
document.getElementById('loader').style.display = 'none';

document.querySelector('#configureButton').addEventListener('click', 
  _=> {
    closeAlerts();
    var ssid = document.getElementById('ssid').value;
    var pass = document.getElementById('password').value;
    sendCredentials(ssid, pass)
    .then(response => {
      if (response.status == '200') {
        //showAlert('doneAlert');
        document.getElementById('loader').style.display = 'block';
      } else {
        showAlert('errorAlert');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      showAlert('errorAlert');
    });
  }
);

function closeAlerts() {
  document.getElementById('doneAlert').style.display = 'none';
  document.getElementById('errorAlert').style.display = 'none';
}

function showAlert(al) {
  document.getElementById('loader').style.display = 'none';
  document.getElementById(al).style.display = 'block';
}
