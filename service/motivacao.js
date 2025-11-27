export async function getMotivationalQuote() {
  const API_KEY = "SUA_API_KEY_AQUI";
  const url = "https://api.api-ninjas.com/v1/quotes?category=fitness";

  try {
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": API_KEY,
      },
    });

    const data = await response.json();
    return data[0];
  } catch (error) {
    console.log("Erro ao buscar frase:", error);
    return null;
  }
}
