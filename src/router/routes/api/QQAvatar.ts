import express, { Request, Response, NextFunction, Router, query } from "express";
import { $fetch } from "ofetch";

export const router: Router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    let { qq } = req.query;
    const QQAvatarBlob = await $fetch(`https://q2.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=3`, {
      method: "GET",
      responseType: "blob",
    });

    const arrayBuffer = await QQAvatarBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (error) {
    res.status(500).send("获取QQ头像失败");
  }
});
