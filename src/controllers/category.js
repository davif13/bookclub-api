import { Category } from "../models";

class CategoryController {
  async getAll(req, res) {
    try {
      const categories = await Category.findAll({
        order: [["name", "ASC"]],
      });
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
}

export default new CategoryController();
