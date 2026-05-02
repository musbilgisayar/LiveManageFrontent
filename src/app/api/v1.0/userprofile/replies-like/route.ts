import { NextResponse } from "next/server";
import { posts } from "../userData";

type LikeCommentBody = {
  postId?: string | number;
  commentId?: string | number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LikeCommentBody;
    const postId = body?.postId;
    const commentId = body?.commentId;

    if (!postId || !commentId) {
      return NextResponse.json(
        {
          ok: false,
          message: "postId ve commentId zorunludur.",
          userMessage: "Yorum beğenisi için gerekli bilgiler eksik.",
          data: null,
        },
        { status: 400 }
      );
    }

    const postIndex = posts.findIndex((x) => x.id === postId);
    if (postIndex < 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Post bulunamadı.",
          userMessage: "İlgili gönderi bulunamadı.",
          data: null,
        },
        { status: 404 }
      );
    }

    const post = posts[postIndex];
    const currentComments = Array.isArray(post?.data?.comments)
      ? post.data.comments
      : [];

    const commentIndex = currentComments.findIndex((x) => x.id === commentId);
    if (commentIndex < 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Yorum bulunamadı.",
          userMessage: "İlgili yorum bulunamadı.",
          data: null,
        },
        { status: 404 }
      );
    }

    const currentComment = currentComments[commentIndex];
    const currentLikeState = Boolean(currentComment?.data?.likes?.like);
    const currentLikeValue =
      typeof currentComment?.data?.likes?.value === "number"
        ? currentComment.data.likes.value
        : 0;

    const nextLikeState = !currentLikeState;
    const nextLikeValue = nextLikeState
      ? currentLikeValue + 1
      : Math.max(0, currentLikeValue - 1);

    const updatedComment = {
      ...currentComment,
      data: {
        ...currentComment.data,
        likes: {
          ...currentComment.data?.likes,
          like: nextLikeState,
          value: nextLikeValue,
        },
      },
    };

    posts[postIndex] = {
      ...post,
      data: {
        ...post.data,

        comments: currentComments.map((item, index) =>
          index === commentIndex ? updatedComment : item
        ),

      },
    };

    return NextResponse.json(
      {
        ok: true,
        message: "Success",
        userMessage: "Yorum beğeni durumu güncellendi.",
        data: posts,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Internal server error",
        userMessage: "İşlem sırasında beklenmeyen bir hata oluştu.",
        error: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 }
    );
  }
}