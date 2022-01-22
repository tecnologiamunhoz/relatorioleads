// Imports
const axios = require('axios');
const express = require("express");
const { google } = require("googleapis");
const app = express();
const nodemailer = require("nodemailer");
const SMTP_CONFIG = require("./config/smtp");
const cors = require("cors");

app.use(cors());

// Envio de Emails
const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: false,
  auth: {
    user: SMTP_CONFIG.user,
    pass: SMTP_CONFIG.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Formata as mensagens a serem enviadas pelo Email
function mensagemFormatadaEmail(array) {
  let stringHead = ` <html>
  <body>`;
  let stringBody = ``;
  let stringFooter = `</body>
  </html> `;

  for(let i =0; i<array.length; i++) {
    let aux = `<div>
    <span><b>${array[i].nome}</b>  ${array[i].data}  (${array[i].dia} leads)<span>
    <table>
      <tr>
        <td>Leads |</td>
        <td>DIA</td>
        <td>| ${array[i].dia}</td>
      </tr>
      <tr>
        <td>Leads |</td>
        <td>INVÁLIDOS</td>
        <td>| ${array[i].invalidos}</td>
      </tr>
      <tr>
        <td>Leads |</td>
        <td>VÁLIDOS</td>
        <td>| ${array[i].validos}</td> 
      </tr>
      <tr>
        <td>Leads |</td>
        <td>MÊS</td>
        <td>| ${array[i].mes}</td>
      </tr>
    </table>
    </div>
    <br>`;
    stringBody+=aux;
  }
  return stringHead + stringBody + stringFooter;
}

async function run(array) {

  const mailSent = await transporter.sendMail({
    text: "Texto do E-mail",
    subject: "Relatório Diário de Leads",
    from: "Ramom Correia <ramom1999@gmail.com>",
    to: ["tecnologiamunhozgrupo@gmail.com", "assistentemhz@gmail.com", "maxmunhozp@gmail.com", "trafego.meneghel@gmail.com"],
    html: mensagemFormatadaEmail(array)
  });

  // console.log(mailSent);
}

// Autenticação Twilio
const accountSid = "ACd6e8683e1d65b6aaa60356a397a3ae65";
const authToken = "fc3a3d5483b6516cc4ce0fb81908fd6e";
const client = require("twilio")(accountSid, authToken);

// Função de envio Whatsapp
const enviar = (info) => {
  client.messages
    .create({
      body: info,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+556198851106",
    })
    .then((message) => console.log(message.sid))
    .done();
};

// Função que pega a data atual
function dataAtualFormatada() {
  var data = new Date(),
    dia = data.getDate().toString(),
    diaF = dia.length == 1 ? "0" + dia : dia,
    mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
    mesF = mes.length == 1 ? "0" + mes : mes,
    anoF = data.getFullYear();
  return anoF + "-" + mesF + "-" + diaF;
}

// Função que formata a mensagem que é enviada para o Whatsapp
function mensagemFormatadaWhatsapp(item) {
  let string = `*${item.nome}*   ${item.data}   (${item.dia} leads)\nLeads | DIA                | ${item.dia} \nLeads | INVÁLIDOS  | ${item.invalidos} \nLeads | VÁLIDOS      | ${item.validos} \nLeads | MÊS              | ${item.mes}`;
  // console.log(string);
  enviar(string);
}

app.get("/", async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Cria a instancia do client
  const client = await auth.getClient();

  // Instancia do Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "155QfBjmdVysr5bZ7YUk28rtJ3CKmlIROHGb_w9JmzAM";

  //Pegar metadata do spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth: auth,
    spreadsheetId: spreadsheetId,
  });

  // Ler linhas do spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: "Leads",
  });

  res.send(getRows.data.values); // Resposta para a tela do usuário

  const dataHoje = dataAtualFormatada(); // 2021-12-26
  const mesAtual = dataHoje.substring(5, 7);

  let arr = [
    { nome: "Objetiva Jr", validos: 0, invalidos: 0, dia: 0, mes: 0, data: "" },
    {
      nome: "Economica",
      validos: 0,
      invalidos: 0,
      dia: 0,
      mes: 0,
      data: "",
    },
    { nome: "PCI", validos: 0, invalidos: 0, dia: 0, mes: 0, data: "" },
    { nome: "Locus", validos: 0, invalidos: 0, dia: 0, mes: 0, data: "" },
    { nome: "Rede Formar", validos: 0, invalidos: 0, dia: 0, mes: 0, data: "" },
    { nome: "Lider Jr", validos: 0, invalidos: 0, dia: 0, mes: 0, data: "" },
    { nome: "FEARP", validos: 0, invalidos: 0, dia: 0, mes: 0, data: "" }
  ];

  for (let i = 1; i < getRows.data.values.length; i++) {
    // A cada iteração, pegamos uma linha da planilha começando da segunda linha
    // Linha da Planilha
    let dia = getRows.data.values[i][0];
    let mes = getRows.data.values[i][0].substring(5, 7);
    let telefone = getRows.data.values[i][2];
    let nomeEmpresa = getRows.data.values[i][7];
    // nomeEmpresa.replace(/\s+/g, '');

    // Análise das informações da linha
    switch (nomeEmpresa) {
      case "Objetiva Jr":
        arr[0].data = dataHoje;
        // Diário
        if (dia == dataHoje && telefone != "") {
          console.log("ENTROU AQUI")
          arr[0].validos++;
          arr[0].dia++;
        } else if (dia == dataHoje && telefone == "") {
          arr[0].invalidos++;
          arr[0].dia++;
        }
        // Total de Leads mensal
        if (mes == mesAtual) {
          arr[0].mes++;
        }
        break;

      case "Economica":
        arr[1].data = dataHoje;
        // Diário
        if (dia == dataHoje && telefone != "") {
          arr[1].validos++;
          arr[1].dia++;
        } else if (dia == dataHoje && telefone == "") {
          arr[1].invalidos++;
          arr[1].dia++;
        }
        // Total de Leads mensal
        if (mes == mesAtual) {
          arr[1].mes++;
        }
        break;
      
      case "PCI":
        arr[2].data = dataHoje;
        // Diário
        if (dia == dataHoje && telefone != "") {
          arr[2].validos++;
          arr[2].dia++;
        } else if (dia == dataHoje && telefone == "") {
          arr[2].invalidos++;
          arr[2].dia++;
        }
        // Total de Leads mensal
        if (mes == mesAtual) {
          arr[2].mes++;
        }
        break;
      
      case "Locus":
        arr[3].data = dataHoje;
        // Diário
        if (dia == dataHoje && telefone != "") {
          arr[3].validos++;
          arr[3].dia++;
        } else if (dia == dataHoje && telefone == "") {
          arr[3].invalidos++;
          arr[3].dia++;
        }
        // Total de Leads mensal
        if (mes == mesAtual) {
          arr[3].mes++;
        }
        break;

      case "Rede Formar":
        arr[4].data = dataHoje;
        // Diário
        if (dia == dataHoje && telefone != "") {
          arr[4].validos++;
          arr[4].dia++;
        } else if (dia == dataHoje && telefone == "") {
          arr[4].invalidos++;
          arr[4].dia++;
        }
        // Total de Leads mensal
        if (mes == mesAtual) {
          arr[4].mes++;
        }
        break;

      case "Lider Jr":
        arr[5].data = dataHoje;
        // Diário
        if (dia == dataHoje && telefone != "") {
          arr[5].validos++;
          arr[5].dia++;
        } else if (dia == dataHoje && telefone == "") {
          arr[5].invalidos++;
          arr[5].dia++;
        }
        // Total de Leads mensal
        if (mes == mesAtual) {
          arr[5].mes++;
        }
        break;

      case "FEARP":
        arr[6].data = dataHoje;
        // Diário
        if (dia == dataHoje && telefone != "") {
          arr[6].validos++;
          arr[6].dia++;
        } else if (dia == dataHoje && telefone == "") {
          arr[6].invalidos++;
          arr[6].dia++;
        }
        // Total de Leads mensal
        if (mes == mesAtual) {
          arr[6].mes++;
        }
        break;
    }
  }

  // ENVIOS - Whatsapp e Email
  const completeHour = new Date().toLocaleTimeString();
  const hour = completeHour.substring(0,2);
  console.log("hour", hour);
  if(hour == "19"){ // Email e Whatsapp
    arr.forEach(mensagemFormatadaWhatsapp)
    run(arr);
  } else if(hour == "09") { // Email
    run(arr);
  }
});

app.listen(1337, (req, res) => console.log("Rodando em 1337"));

// Lógica do envio em determinado horário
const api = axios.create({baseURL: 'http://localhost:1337'});

const sendAll = async () => {
  const hour = new Date().toLocaleTimeString();
  console.log(hour);
  if(hour == "09:00:00" || hour == "09:00:00 AM" || hour == "19:00:00 PM" || hour == "19:00:00" ) {
    try {
      await api.get("/");
      console.log("Relatório Enviado")
    } catch (error) {
      console.log(error)
    }
  }
  
}

setInterval(sendAll, 1000);
