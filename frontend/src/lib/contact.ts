// Confirmed contact data taken from the current site (expressbateriasrio.com.br).
export const PHONE_DISPLAY = "(21) 99940-4005";
export const PHONE_TEL = "tel:+5521999404005";
export const WA_NUMBER = "5521999404005";
export const INSTAGRAM_URL = "https://www.instagram.com/expressbateriasrj/";
export const INSTAGRAM_HANDLE = "@expressbateriasrj";
export const MAPS_URL = "https://www.google.com/maps?cid=5553564379686471721";

export const waLink = (message: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

export const WA_MESSAGES = {
  general: "Olá, Express Baterias! Vim pelo site e preciso de atendimento para bateria.",
  emergency: "Olá, Express Baterias! Minha bateria arriou e preciso de socorro. Meu carro é: ",
  car: "Olá! Quero orçamento de bateria para carro. Modelo e ano: ",
  moto: "Olá! Quero orçamento de bateria para moto. Modelo e ano: ",
  truck: "Olá! Quero orçamento de bateria para caminhão/utilitário. Modelo e ano: ",
  cheaper: "Olá! Tenho um orçamento de bateria mais barato e quero saber se vocês cobrem.",
  notFound: "Olá! Não encontrei meu veículo no buscador do site. Meu carro é (modelo, ano e motor): ",
} as const;

// Neighbourhoods listed on the current site's lead form.
export const NEIGHBORHOODS = [
  "Botafogo",
  "Catete",
  "Centro",
  "Copacabana",
  "Flamengo",
  "Glória",
  "Ipanema",
  "Lagoa",
  "Laranjeiras",
  "Leblon",
  "Tijuca",
];

export const NEEDS = [
  "Bateria arriou — socorro agora",
  "Trocar a bateria do carro",
  "Bateria para moto",
  "Bateria para caminhão ou utilitário",
  "Só um orçamento",
];
