function setErrorFor(input, message) {
  const formGroup = input.parentElement;
  const small = formGroup.querySelector('small');
  small.innerText = message;
  formGroup.className = 'form-group error';
}

function setWarnFor(input, message) {
  const formGroup = input.parentElement;
  const small = formGroup.querySelector('small');
  small.innerText = message;
  formGroup.className = 'form-group warn';
}

function setSuccessFor(input) {
  const formGroup = input.parentElement;
  formGroup.className = 'form-group success';
}

function switchButton(state) {
  const btn = document.getElementById('btn');
  if (state === false) {
    btn.disabled = true;
    btn.classList.add('locked');
    btn.innerHTML = "<i class='bx bxs-lock-alt locke'></i> Sign in";
  } else {
    btn.disabled = false;
    btn.classList.remove('locked');
    btn.innerHTML = "Sign in"
  }
}
