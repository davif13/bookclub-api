import { Book, Category, Author } from "../models";
import * as Yup from "yup";

class BookController {
  async create(req, res) {
    try {
      const schema = Yup.object().shape({
        author_id: Yup.number().required("Author id is mandatory."),
        category_id: Yup.number().required("Category id is mandatory."),
        name: Yup.string().required(),
        cover_url: Yup.string().url("Cover_url should be a valid URL."),
        release_date: Yup.date(
          "Release date should be in a valid date format."
        ),
        pages: Yup.number(),
        synopsis: Yup.string(),
        highlighted: Yup.boolean(),
      });

      await schema.validate(req.body);

      const { author_id, category_id } = req.body;

      const category = await Category.findByPk(category_id);

      if (!category) {
        return res.status(404).json({ error: "Category not found." });
      }

      const author = await Author.findByPk(author_id);

      if (!author) {
        return res.status(404).json({ error: "Author not found." });
      }

      const createdBook = await new Book({
        ...req.body,
      });

      await createdBook.save();

      return res.status(200).json({ createdBook });
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }

  async getAll(req, res) {
    const { highlighted, category_id } = req.query;
    try {
      const where = {};

      if (highlighted) {
        where.highlighted = true;
      }

      if (category_id) {
        where.category_id = Number(category_id);
      }

      const books = await Book.findAll({
        where,
        include: [
          {
            model: Author,
            as: "author",
            attributes: ["name"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["name"],
          },
        ],
      });

      return res.status(200).json(books);
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
}

export default new BookController();
