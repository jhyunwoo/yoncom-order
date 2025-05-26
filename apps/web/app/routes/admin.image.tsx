import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const path = formData.get("path") as string;

    if (!image || !path) {
      return json({ error: "이미지와 경로가 필요합니다" }, { status: 400 });
    }

    // 업로드 디렉토리 생성
    const uploadDir = join(process.cwd(), "apps", "web", "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 파일 확장자 추출
    const fileExtension = image.name.split('.').pop() || 'jpg';
    const fileName = `${path}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // 파일 저장
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 웹에서 접근 가능한 경로 반환
    const webPath = `/uploads/${fileName}`;

    return json({ path: webPath });
  } catch (error) {
    console.error("이미지 업로드 에러:", error);
    return json({ error: "이미지 업로드에 실패했습니다" }, { status: 500 });
  }
}; 