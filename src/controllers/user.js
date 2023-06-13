import { User } from "../models";

class UserController {
  async create(req, res) {
    const user = new User({
      name: "Davi",
      email: "davi.ffa@gmail.com",
      password: "teste@123",
      password_hash: "teste@123",
    });

    await user.save();

    return res.json({ user });
  }
}

export default new UserController();
