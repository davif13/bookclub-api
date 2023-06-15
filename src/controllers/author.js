import { Author } from "../models";
import * as Yup from "yup";

class AuthorController {
  async create(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string()
          .required("Name is required.")
          .min(3, "Name should have 3 or more characters."),
        avatar_url: Yup.string().url("avatar_url should be in URL format."),
      });

      await schema.validate(req.body);

      const createdAuthor = await new Author({
        ...req.body,
      });

      await createdAuthor.save();

      return res.status(200).json({ createdAuthor });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async findAll(req, res) {
    try {
      const authors = await Author.findAll({
        order: [["name", "ASC"]],
      });
      return res.status(200).json(authors);
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new AuthorController();
