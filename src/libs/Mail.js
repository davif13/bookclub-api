import Mailjet from "node-mailjet";

const mailJet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);
class Mail {
  async sendForgotPasswordEmail(email, name, token) {
    try {
      const result = await mailJet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "$SENDER_EMAIL",
              Name: "Me",
            },
            To: [
              {
                Email: email,
                Name: name,
              },
            ],
            TemplateID: 4883212,
            TemplateLanguage: true,
            Subject: "Alteração de Senha - Bookclub",
            Variables: {
              name: name,
              token: token,
            },
          },
        ],
      });
      request
        .then((result) => {
          console.log(result.body);
        })
        .catch((err) => {
          console.log(err.statusCode);
        });
    } catch (error) {
      return { error };
    }
  }
}

export default new Mail();
