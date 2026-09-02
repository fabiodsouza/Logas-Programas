/* EXEMPLO do arquivo realizado.js
   O Power Automate deve gerar um arquivo chamado exatamente "realizado.js"
   nesta mesma pasta, com este conteúdo (window.LOGAS_REALIZADO).
   Renomeie este exemplo para realizado.js para testar manualmente.

   Campos (todos opcionais, menos cliente + data/dataHora):
     cliente       -> CLIENTE
     dataHora      -> DATA E HORA INICIAL  (o kanban separa data e hora de chegada)
       (ou, se preferir separar você mesmo: data "AAAA-MM-DD" + chegada "HH:MM")
     cavalo        -> placacavalo (placa do cavalo)
     carreta       -> CARRETA 1 (+ CARRETA 2)
     motorista     -> nome_motorista
     barChegada    -> PRESSAO_CHEGADA
     barFinal      -> PRESSAO_FINALIZADA
     abastecimento -> ABASTECIMENTO_QTY
     nf            -> nota_fiscal (ou m2nfe)
     base          -> baseOrigem
*/
window.LOGAS_REALIZADO = {
  atualizado: "2026-07-06T09:00:00",
  registros: [
    {
      cliente: "BELGO",
      dataHora: "2026-07-06 10:20",
      cavalo: "ABC1D23",
      carreta: "CRT-1234",
      motorista: "João",
      barChegada: 98,
      barFinal: 205,
      abastecimento: "3200",
      nf: "123456",
      base: "BETIM"
    },
    {
      cliente: "G.PERDÕES",
      dataHora: "06/07/2026 13:20",
      cavalo: "XYZ9K88",
      motorista: "Pedro",
      barChegada: 60,
      barFinal: 210,
      abastecimento: "5000"
    }
  ]
};
