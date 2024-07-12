/*
--------------------------------------------------------------------------------------
#region Inicialização
--------------------------------------------------------------------------------------
*/
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btnEventos").click();

  verificaAutenticacao();

  habilitarTabsComplementares(false);
  configurarAccordion();
  consultarEventos();
});

/*
--------------------------------------------------------------------------------------
#region Autenticação e Segurança
--------------------------------------------------------------------------------------
*/
function verificaAutenticacao() {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirecionar para a página de login se o token não estiver presente
    window.location.href = 'login.html';
  }
}

/*
--------------------------------------------------------------------------------------
#region Controle de Abas
--------------------------------------------------------------------------------------
*/
function obtemEventoIdSelecionado(value) {
  var hiddenField = document.getElementById("hidEvento");

  if (value != null && value != '' && value != undefined)
    hiddenField.value = value;

  return hiddenField.value;
}
function openTab(evt, nomeTab) {

  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(nomeTab).style.display = "block";
  evt.currentTarget.className += " active";

  configurarTab(nomeTab);
}
function configurarTab(tab) {

  var eventoId = obtemEventoIdSelecionado();

  switch (tab) {
    case 'Eventos':
      break;
    case 'ManterEvento':
      configurarManterEvento(eventoId);
      break;
    case 'Participantes':
      break;
  }
}

/*
--------------------------------------------------------------------------------------
#region Aba Eventos
--------------------------------------------------------------------------------------
*/
function consultarEventos() {

  limparGrid('grid');

  let url = 'http://localhost:5001/evento';
  fetch(url, {
    method: 'get',
    headers: {
      'Authorization': localStorage.getItem('token')
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.eventos.forEach(item => insertListEvento(item.id, item.nome,
        item.data_inicio))
      configuraMetodoDeExclusao("grid");
      configuraMetodoDeEdicao("grid");
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
const insertListEvento = (id, nome, data_inicio) => {
  var item = [nome, data_inicio, id];

  var table = document.getElementById('grid');

  var row = table.insertRow();

  for (var i = 0; i <= item.length; i++) {

    var cel = row.insertCell(i);

    if (i == 1 || i == 1) {
      cel.textContent = TrataData(item[i]);
      cel.style.textAlign = "center";
    }
    else if (i == 2) {
      cel.appendChild(criarControleDeExclusao('grid'));
      cel.style.textAlign = "center";
    }
    else if (i == 3) {
      cel.appendChild(criarControleDeEdit('grid'));
      cel.appendChild(criaControleHidden('grid', item[2]));
      cel.style.textAlign = "center";
    }
    else {
      cel.textContent = item[i];
    }
  }
}

function novoEvento(evt) {
  if (confirm('Confirma o preenchimento de um novo evento?')) {
    limparFormulario();
    habilitarTabsComplementares(false);
    var hiddenField = document.getElementById("hidEvento");
    hiddenField.value = null;
    obtemEventoIdSelecionado();
  }
}
function limparFormulario() {
  limparDadosGerais();
  limparResponsavel();
  limparCentrosDeInteresse();
  limparParticipantes();
}
function habilitarTabsComplementares(habilita) {
  var btnManterEvento = document.getElementById("btnManterEvento");
  var btnParticipantes = document.getElementById("btnParticipantes");
  btnManterEvento.disabled = !habilita;
  btnParticipantes.disabled = !habilita;
}
function editarEvento(eventoId) {

  limparFormulario();

  carregaDadosDoEvento(eventoId);

  obtemEventoIdSelecionado(eventoId);

  configurarManterEvento(eventoId);

  habilitarTabsComplementares(true);

  carregarResponsaveisDoEvento();

  getListCentroDeInteresse();

  getListParticipante();

  getListCentrosDeInteressePorParticipante();
}
function carregaDadosDoEvento(eventoId) {

  let url = 'http:/localhost:5001/eventoporid?id=' + eventoId;
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('newNome').value = data.nome;
      document.getElementById('newInicio').value = TrataDataParaInput(TrataData(data.data_inicio));
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
--------------------------------------------------------------------------------------
#region Aba Manter Eventos 
--------------------------------------------------------------------------------------
*/
function configurarManterEvento(eventoId) {
  carregarManterEventos(eventoId)
}
function limparDadosGerais() {
  document.getElementById("newNome").value = null;
  document.getElementById("newInicio").value = null;
}
function carregarManterEventos(eventoId) {
  if (eventoId != '') {
    carregarCentrosDeInteresse();
  }
}
const salvarEvento = () => {
  let inputNome = document.getElementById("newNome").value;
  let inputInicio = document.getElementById("newInicio").value;

  if (inputNome === '') {
    alert("Nome do Evento é obrigatório!");
  }
  else if (inputInicio === '') {
    alert("Data do Evento é obrigatória!");
  }
  else if (new Date(inputInicio) < new Date()) {
    alert("Data do Evento não pode ser menor que a data de hoje!");
  }
  else {
    eventoid = obtemEventoIdSelecionado();
    if (eventoid == null || eventoid == '') {
      postEvento(inputNome, inputInicio, inputInicio)
      alert("Evento criado com sucesso!");
      habilitarTabsComplementares(true);
    }
    else {
      putEvento(eventoid, inputNome, inputInicio, inputInicio)
      alert("Evento salvo com sucesso!");
    }
    consultarEventos();
  }
}
const postEvento = async (inputNome, inputInicio, inputTermino) => {
  const formData = new FormData();
  formData.append('nome', inputNome);
  formData.append('data_inicio', inputInicio);
  formData.append('data_fim', inputTermino);

  let url = 'http://localhost:5001/evento';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then(data => {
      obtemEventoIdSelecionado(data.id);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}
const putEvento = async (id, inputNome, inputInicio, inputTermino) => {
  const formData = new FormData();fe
  formData.append('id', id);
  formData.append('nome', inputNome);
  formData.append('data_inicio', inputInicio);
  formData.append('data_fim', inputTermino);

  let url = 'http://localhost:5001/atualizarevento';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}
function configurarAccordion() {
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");

      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
}
function excluirEvento(id) {
  const formData = new FormData();
  formData.append('id', id);

  let url = 'http://localhost:5001/evento';
  fetch(url, {
    method: 'delete',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message == null) {
        alert('Excluído com Sucesso!')
        consultarEventos();
      }
      else
        alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}

// --------------------------------------------------------------------------------------
// #region Responsaveis
// --------------------------------------------------------------------------------------
function salvarResponsavel() {
  let inputResponsavel = document.getElementById("newResponsavel").value;
  let inputMatricula = document.getElementById("newMatricula").value;
  let inputEmail = document.getElementById("newEmail").value;

  if (inputResponsavel === '') {
    alert("Nome do Responsavel é obrigatório!");

  } else if (inputMatricula === '') {
    alert("Matrícula do Responsavel é obrigatória!");
  } else {
    postResponsavel(inputResponsavel, inputMatricula, inputEmail)
  }
}
const postResponsavel = async (inputResponsavel, inputMatricula, inputEmail) => {
  const formData = new FormData();
  formData.append('nome', inputResponsavel);
  formData.append('matricula', inputMatricula);
  formData.append('email', inputEmail);
  formData.append('eventoId', obtemEventoIdSelecionado());

  let url = 'http:/localhost:5001/responsavel?eventoid=' + obtemEventoIdSelecionado();
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message == null) {
        carregarResponsaveisDoEvento();
        alert("Responsavel Salvo!");
      }
      else
        alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}
function carregarResponsaveisDoEvento() {
  getListResponsavel();
}
function getListResponsavel() {

  limparGrid('tableResponsavel');

  let url = 'http:/localhost:5001/responsavel?eventoid=' + obtemEventoIdSelecionado();
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.responsavels.forEach(item => insertListResponsavel(
        item.nome, item.matricula, item.id))
      configuraMetodoDeExclusao('tableResponsavel');
      bindComboResponsaveis(data.responsavels);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
const insertListResponsavel = (nome, matricula, id) => {
  var item = [nome, matricula, id]

  var table = document.getElementById('tableResponsavel');

  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    if (i == item.length - 1) {
      cel.appendChild(criarControleDeExclusao('tableResponsavel'));
      cel.appendChild(criaControleHidden('tableResponsavel', item[2]));
      cel.style.textAlign = "center";
    }
    else {
      cel.textContent = item[i];
    }
  }
}
function excluirResponsavel(id) {
  const formData = new FormData();
  formData.append('id', id);

  let url = 'http://localhost:5001/responsavel';
  fetch(url, {
    method: 'delete',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message == null) {
        alert('Excluído com Sucesso!')
        carregarResponsaveisDoEvento();
      }
      else
        alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}
function limparDadosResponsavel() {
  document.getElementById("newResponsavel").value = null;
  document.getElementById("newMatricula").value = null;
  document.getElementById("newEmail").value = null;
}
function limparResponsavel() {
  limparDadosResponsavel();
  limparGrid('tableResponsavel');
}
// --------------------------------------------------------------------------------------
// #region Centros de Interesse
// --------------------------------------------------------------------------------------
function carregarCentrosDeInteresse() {
  carregarResponsaveisDoEvento();
  getListSalas();
  getListCentroDeInteresse();
}
const bindComboSalas = (data) => {
  var combo = document.getElementById('comboSala');
  combo.innerHTML = '';

  data.forEach(function (item) {
    var option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nome;
    combo.appendChild(option);
  });
}
const getListSalas = async () => {
  let url = 'http:/localhost:5001/sala';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      bindComboSalas(data.salas);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
const bindComboResponsaveis = (data) => {

  limparCombosResponsaveis();

  var combo = document.getElementById('comboResponsavel');

  combo.innerHTML = '';

  data.forEach(function (item) {
    var option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nome;
    combo.appendChild(option);
  });
}

const salvarCentroDeInteresse = () => {
  let inputTema = document.getElementById("newTema").value;
  let inputComboResponsavel = document.getElementById("comboResponsavel").value;
  let inputSala = document.getElementById("comboSala").value;

  if (inputTema === '') {
    alert("Nome do Centro de Interesse é obrigatório!");
  } else {
    postCentroDeInteresse(inputTema, inputComboResponsavel, inputSala)
  }
}
const postCentroDeInteresse = async (inputTema, inputComboResponsavel, inputSala) => {
  const formData = new FormData();
  formData.append('tema', inputTema);
  formData.append('responsavelId', inputComboResponsavel);
  formData.append('salaId', inputSala);

  let url = 'http://localhost:5001/centrodeinteresse';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message == null) {
        carregarCentrosDeInteresse();
        getListCentrosDeInteressePorParticipante();
        alert("Centro de Interesse Salvo!");
      }
      else
        alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}
const getListCentroDeInteresse = async () => {

  limparGrid('tableCentrosDeInteresse');

  let url = 'http:/localhost:5001/centrodeinteresse?eventoId=' + obtemEventoIdSelecionado();
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.centrodeinteresses.forEach(item => insertListCentroDeInteresse(
        item.tema, item.responsavel, item.sala, item.id))
      configuraMetodoDeExclusao('tableCentrosDeInteresse');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
const insertListCentroDeInteresse = (tema, responsavel, sala, id) => {
  var item = [tema, responsavel, sala, id]
  var table = document.getElementById('tableCentrosDeInteresse');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {

    var cel = row.insertCell(i);

    if (i == item.length - 1) {
      cel.appendChild(criarControleDeExclusao('tableCentrosDeInteresse'));
      cel.appendChild(criaControleHidden('tableCentrosDeInteresse', item[3]));
      cel.style.textAlign = "center";
    }
    else {
      cel.textContent = item[i];
    }
  }
}
function excluirCentrosDeInteresse(id) {
  const formData = new FormData();
  formData.append('id', id);

  let url = 'http://localhost:5001/centrodeinteresse';
  fetch(url, {
    method: 'delete',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message == null) {
        alert('Excluído com Sucesso!')
        getListCentroDeInteresse();
        getListCentrosDeInteressePorParticipante();
      }
      else
        alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}
function limparCombosResponsaveis() {
  var combo = document.getElementById("comboResponsavel");
  combo.options.length = 0;
}
function limparCamposCentrosDeInteresse() {
  document.getElementById("newTema").value = null;
}
function limparCentrosDeInteresse() {
  limparCombosResponsaveis();
  limparCamposCentrosDeInteresse();
  limparGrid('tableCentrosDeInteresse');
}
/* ----------------------------------------------------------------------------------- */
// #region Participantes
// --------------------------------------------------------------------------------------
const salvarParticipante = () => {
  let inputParticipante = document.getElementById("newNomeParticipante").value;
  let inputMatricula = document.getElementById("newEmailParticipante").value;
  let inputInscricao = document.getElementById("newInscricao").value;

  if (inputParticipante === '') {
    alert("Nome do Participante é obrigatório!");

  } else if (inputMatricula === '') {
    alert("Inscrição do Participante é obrigatória!");
  } else {
    postParticipante(inputParticipante, inputMatricula, inputInscricao)
  }
}
const postParticipante = async (inputParticipante, inputMatricula, inputInscricao) => {
  const formData = new FormData();
  formData.append('nome', inputParticipante);
  formData.append('email', inputMatricula);
  formData.append('inscricao', inputInscricao);
  formData.append('idevento', obtemEventoIdSelecionado());

  formData.append('cep', document.getElementById('cep').value);
  formData.append('logradouro', document.getElementById('logradouro').value);
  formData.append('numero', document.getElementById('numero').value);
  formData.append('complemento', document.getElementById('complemento').value);
  formData.append('bairro', document.getElementById('bairro').value);
  formData.append('localidade', document.getElementById('localidade').value);
  formData.append('uf', document.getElementById('uf').value);

  var centrosdeinteresse = getSelectedItems();
  centrosdeinteresse.forEach(centrodeinteresse => {
    formData.append(`centrosdeinteresse`, centrodeinteresse);
  });

  let url = 'http://localhost:5001/participante';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message == null) {
        limparGrid('tableParticipante');
        getListParticipante();
        limparDadosParticipantes();
        getListCentrosDeInteressePorParticipante();
        alert("Participante Salvo!");
      }
      else
        alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}

const getListParticipante = async () => {
  let url = 'http:/localhost:5001/participante?eventoId=' + obtemEventoIdSelecionado()
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.participantes.forEach(item => insertListParticipante(
        item.id, item.nome, item.email, item.inscricao, item.uf))
      configuraMetodoDeExclusao('tableParticipante');
      configuraMetodoDeAbrirModal('tableParticipante');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
const insertListParticipante = (id, nome, email, inscricao, uf) => {

  var item = [nome, email, inscricao, uf, id]
  var table = document.getElementById('tableParticipante');
  var row = table.insertRow();

  for (var i = 0; i <= item.length; i++) {
    var cel = row.insertCell(i);
    if (i == item.length - 1) {
      cel.appendChild(criarControleDeExclusao('tableParticipante'));
      cel.appendChild(criaControleHidden('tableParticipante', item[4]));
      cel.style.textAlign = "center";
    }
    else if (i == item.length) {
      cel.appendChild(criarControleCentrosDoParticipante('tableParticipante'));
      cel.style.textAlign = "center";
    }
    else {
      cel.textContent = item[i];
    }
  }
}

function addExpandButtonToRow(row) {
  const button = document.createElement('button');
  button.innerText = 'Expandir';
  button.addEventListener('click', function () {
    expandRow(row);
  });
  row.appendChild(button);
}

function expandRow(row) {
  const extraContent = row.querySelector('.extra-content');

  if (extraContent.style.display === 'none') {
    extraContent.style.display = 'table-row';
  } else {
    extraContent.style.display = 'none';
  }
}

const getListCentrosDeInteressePorParticipante = async () => {
  let url = 'http:/localhost:5001/centrodeinteresse?eventoId=' + obtemEventoIdSelecionado();
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {

      loadGridgridCentrosDeParticipantes(data)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
async function loadGridgridCentrosDeParticipantes(data) {

  const grid = document.getElementById('gridCentrosDeParticipantes');

  grid.innerHTML = '';

  data.centrodeinteresses.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('checkboxgrid-item');

    const divCheckBox = criaFormGroupDiv();
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('checkbox');
    checkbox.dataset.id = item.id;
    divCheckBox.style.paddingRight = "2%";
    divCheckBox.style.textAlign = 'left';
    divCheckBox.appendChild(checkbox);

    const divTema = criaFormGroupDiv();
    const label = document.createElement('label');
    label.textContent = "Tema: " + item.tema;
    divTema.style.width = "30%";
    divTema.style.textAlign = 'left';
    divTema.appendChild(label);

    const divResponsavel = criaFormGroupDiv();
    const labelresponsavel = document.createElement('label');
    labelresponsavel.textContent = "Responsável: " + item.responsavel;
    divResponsavel.style.width = "20%";
    divResponsavel.appendChild(labelresponsavel);

    div.appendChild(divCheckBox);
    div.appendChild(divTema);
    div.appendChild(divResponsavel);

    grid.appendChild(div);
  });
}
// Função para verificar os itens selecionados
function getSelectedItems() {
  const checkboxes = document.querySelectorAll('.checkbox');
  var selectedItems = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const id = checkbox.getAttribute('data-id');
      selectedItems.push(Number(id));
    }
  });

  console.log('IDs dos itens selecionados:', selectedItems);
  return selectedItems;
}
async function loadDivCentrosDeInteresseDoParticipante(data) {

  const grid = document.getElementById('divCentrosDeInteresseDoParticipante');

  grid.innerHTML = '';

  data.centrodeinteresses.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('checkboxgrid-item');

    const divCheckBox = criaFormGroupDiv();
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('checkbox');
    checkbox.checked = true;
    checkbox.disabled = true;
    divCheckBox.style.paddingRight = "2%";
    divCheckBox.appendChild(checkbox);

    const divTema = criaFormGroupDiv();
    const label = document.createElement('label');
    label.textContent = "Tema: " + item.tema;
    divTema.style.width = "45%";
    divTema.style.textAlign = "left";
    divTema.appendChild(label);

    const divResponsavel = criaFormGroupDiv();
    const labelresponsavel = document.createElement('label');
    labelresponsavel.textContent = "Responsável: " + item.responsavel;
    divResponsavel.style.width = "45%";
    divResponsavel.style.textAlign = "left";
    divResponsavel.appendChild(labelresponsavel);

    div.appendChild(divCheckBox);
    div.appendChild(divTema);
    div.appendChild(divResponsavel);

    grid.appendChild(div);
  });
}
function excluirParticipante(id) {
  const formData = new FormData();
  formData.append('id', id);

  let url = 'http://localhost:5001/participante';
  fetch(url, {
    method: 'delete',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message == null) {
        alert('Excluído com Sucesso!')
        limparGrid('tableParticipante');
        getListParticipante();
      }
      else
        alert(data.message);
    })
    .catch((error) => {
      console.error('Error:', error);
      mostrarAlerta('Error:', error);
    });
}
function limparDadosParticipantes() {
  document.getElementById("newNomeParticipante").value = null;
  document.getElementById("newEmailParticipante").value = null;
  document.getElementById("newInscricao").value = null;

  document.getElementById('cep').value = null;
  document.getElementById('logradouro').value = null;
  document.getElementById('numero').value = null;
  document.getElementById('complemento').value = null;
  document.getElementById('bairro').value = null;
  document.getElementById('localidade').value = null;
  document.getElementById('uf').value = null;

}
function limparParticipantes() {
  limparDadosParticipantes();
  var divCentrosDoParticipante = document.getElementById("gridCentrosDeParticipantes");
  divCentrosDoParticipante.innerHTML = '';
  limparGrid('tableParticipante');
}

function buscarCEP() {
  const cep = document.getElementById('cep').value;
  const url = `https://viacep.com.br/ws/${cep}/json/`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        document.getElementById('resultado').innerText = 'CEP não encontrado!';
      } else {
        document.getElementById('logradouro').value = data.logradouro;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('localidade').value = data.localidade;
        document.getElementById('uf').value = data.uf;

      }
    })
    .catch(error => {
      console.error('Erro ao buscar o CEP:', error);
      document.getElementById('resultado').innerText = 'Erro ao buscar o CEP!';
    });
}

/* ----------------------------------------------------------------------------------- */
/* #region Funções em comum
/* ----------------------------------------------------------------------------------- */
function TrataData(dataString) {
  var data = new Date(dataString);

  var dia = data.getDate();
  var mes = data.getMonth() + 1; // Os meses são baseados em zero (janeiro é 0), então adicionamos 1
  var ano = data.getFullYear();

  // Formatar a data no formato dd/mm/yyyy
  return (dia < 10 ? '0' : '') + dia + '/' + (mes < 10 ? '0' : '') + mes + '/' + ano;
}
function TrataDataParaInput(dataString) {
  const partes = dataString.split('/');
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}
function mostrarAlerta(mensagem) {
  var alertDiv = document.getElementById('custom-alert');
  var messageSpan = document.getElementById('alert-message');
  messageSpan.textContent = mensagem;
  alertDiv.style.display = 'block';
}
function fecharAlerta() {
  var alertDiv = document.getElementById('custom-alert');
  alertDiv.style.display = 'none';
}
function excluir(id, nomeTabela) {
  switch (nomeTabela) {
    case 'grid':
      excluirEvento(id);
      limparFormulario();
      break;
    case 'tableResponsavel':
      excluirResponsavel(id);
      break;
    case "tableCentrosDeInteresse":
      excluirCentrosDeInteresse(id);
      break;
    case 'tableParticipante':
      excluirParticipante(id);
      break;
  }
}
function editar(id, nomeTabela) {
  switch (nomeTabela) {
    case 'grid':
      editarEvento(id);
      break;
  }
}

/* ----------------------------------------------------------------------------------- */
/* #region Funções de montagem de Grid
/* ----------------------------------------------------------------------------------- */
function criarControleDeExclusao(nomeTabela) {
  var excluiCellImagem = document.createElement('img');

  excluiCellImagem.src = "https://cdn-icons-png.flaticon.com/512/126/126468.png";
  excluiCellImagem.style.width = '15px';
  excluiCellImagem.style.height = '15px';
  excluiCellImagem.classList.add('excluir_' + nomeTabela);

  return excluiCellImagem;
}
function criarControleDeEdit(nomeTabela) {
  var editCellImagem = document.createElement('img');

  editCellImagem.src = "edit.png";
  editCellImagem.style.width = '15px';
  editCellImagem.style.height = '15px';
  editCellImagem.classList.add('editar_' + nomeTabela);

  return editCellImagem;
}
function criarControleCentrosDoParticipante(nomeTabela) {
  var centroporparticipanteCellImagem = document.createElement('img');

  centroporparticipanteCellImagem.src = "edit.png";
  centroporparticipanteCellImagem.style.width = '15px';
  centroporparticipanteCellImagem.style.height = '15px';
  centroporparticipanteCellImagem.classList.add('btnmodal_' + nomeTabela);

  return centroporparticipanteCellImagem;
}
function criaControleHidden(nomeTabela, id) {

  var hiddenField = document.createElement("input");
  hiddenField.type = "hidden";
  hiddenField.classList.add("idHidden_" + nomeTabela);
  hiddenField.value = id

  return hiddenField;
}
function criaFormGroupDiv() {
  const div = document.createElement("div");
  return div;
}
function limparGrid(nomeTabela) {
  var tbody = document.getElementById(nomeTabela);
  var linhas = tbody.querySelectorAll('tr');
  for (var i = 1; i < linhas.length; i++) {
    linhas[i].remove(); // Remover a linha
  }
}
function configuraMetodoDeExclusao(nomeTabela) {
  // Seleciona todos os botões de excluir e adiciona evento de clique
  var botoesExcluir = document.querySelectorAll('.excluir_' + nomeTabela);
  botoesExcluir.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var id = this.parentNode.parentNode.querySelector('.idHidden_' + nomeTabela).value;
      excluir(id, nomeTabela);
    });
  });
}
function configuraMetodoDeEdicao(nomeTabela) {
  // Seleciona todos os botões de excluir e adiciona evento de clique
  var botesEditar = document.querySelectorAll('.editar_' + nomeTabela);
  botesEditar.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var id = this.parentNode.parentNode.querySelector('.idHidden_' + nomeTabela).value;
      editar(id, nomeTabela);
    });
  });
}
function configuraMetodoDeAbrirModal(nomeTabela) {
  // Seleciona todos os botões de excluir e adiciona evento de clique
  var botesEditar = document.querySelectorAll('.btnmodal_' + nomeTabela);
  botesEditar.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var id = this.parentNode.parentNode.querySelector('.idHidden_' + nomeTabela).value;
      let url = 'http://localhost:5001/participante/centrosdeinteresse?eventoId=' + id;
      fetch(url, {
        method: 'get',
      })
        .then((response) => response.json())
        .then(data => {
          loadDivCentrosDeInteresseDoParticipante(data);
          openModal();
        })
        .catch(error => console.error('Erro ao obter dados da API:', error));
    });
  });
}

/* ----------------------------------------------------------------------------------- */
/* #region Modal
/* ----------------------------------------------------------------------------------- */
function openModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
}

document.getElementsByClassName('close')[0].addEventListener('click', function () {
  closeModal();
});

window.addEventListener('click', function (event) {
  const modal = document.getElementById('myModal');
  if (event.target == modal) {
    closeModal();
  }
});