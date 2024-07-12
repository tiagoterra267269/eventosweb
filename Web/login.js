/*
--------------------------------------------------------------------------------------
#region Inicialização
--------------------------------------------------------------------------------------
*/
function login1() {

  const inputLogin = document.getElementById("login").value;
  const inputSenha = document.getElementById("senha").value;


 const formData = new FormData();
 formData.append('login', inputLogin);
 formData.append('senha', inputSenha);
 
    fetch("http://localhost:5000/login", {
      method: "post",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          alert("Login successful!");
          window.location.href = "index.html"; // Redirecionar para a página protegida
        } else {
          alert("Login failed!");
          return false;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
        return false;
      });
  }


  // function login1() {
  //   document
  //     .getElementById("loginForm")
  //     .addEventListener("submit", function (event) {
  //       event.preventDefault();
  //       const inputLogin = document.getElementById("login").value;
  //       const inputSenha = document.getElementById("senha").value;

  //       const formData = new FormData();
  //       formData.append('login', inputLogin);
  //       formData.append('senha', inputSenha);

  //       fetch("http://autenticadorapi:5000/login", {
  //         method: "POST",
  //         body: formData
  //       })
  //         .then((response) => response.json())
  //         .then((data) => {
  //           if (data.token) {
  //             localStorage.setItem("token", data.token);
  //             alert("Login successful!");
  //             window.location.href = "index.html"; // Redirecionar para a página protegida
  //           } else {
  //             alert("Login failed!");
  //             return false;
  //           }
  //         })
  //         .catch((error) => {
  //           console.error("Error:", error);
  //           alert("An error occurred. Please try again.");
  //           return false;
  //         });
  //     });
  // }


  function login(usuario, senha) {

    if (validar(usuario, senha))
      redireciona();

  }

  function validar(usuario, senha) {
    let url = "";
    fetch(url, {
      method: 'get',
    })
      .then((response) => response.json())
      .then((data) => {

        if (data.token != null) {
          localStorage.setItem("token", data.token);

          return true;

        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return false;
  }

  function redireciona() {
    localStorage.setItem('token', data.token)
    alert('Login successful!');
    window.location.href = 'index.html'; // Redirecionar para a página protegida
  }