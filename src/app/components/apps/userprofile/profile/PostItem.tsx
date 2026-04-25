'use client';

import React, { useContext, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  CardMedia,
  Divider,
  Fab,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  IconCircle,
  IconMessage2,
  IconShare,
  IconThumbUp,
} from '@tabler/icons-react';
import uniqueId from 'lodash/uniqueId';
import PostComments from './PostComments';
import BlankCard from '../../../shared/BlankCard';
import {
  Comment as CommentType,
  PostType,
} from '../../../../[locale]/(DashboardLayout)/types/apps/userProfile';
import { UserDataContext } from '@/app/context/UserDataContext';
import { CustomizerContext } from '@/app/context/customizerContext';

interface Props {
  post: PostType;
}

const PostItem: React.FC<Props> = ({ post }) => {
  const { likePost, addComment } = useContext(UserDataContext);

  // 🩵 CustomizerContext güvenli erişim
  const customizer = useContext(CustomizerContext);
  const isBorderRadius = customizer?.isBorderRadius ?? 8; // fallback değeri 8 px

  const [comText, setComText] = useState<string>('');

  const handleLike = (postId: number | string) => {
    likePost(postId);
  };

  const onSubmit = (postId: string, comment: string) => {
    if (!comment.trim()) return;
    const commentId = uniqueId('#COMMENT_');
    const newComment: CommentType = {
      id: commentId,
      profile: {
        id: uniqueId('#COMMENT_'),
        avatar: post.profile.avatar,
        name: post.profile.name,
        time: 'now',
      },
      data: {
        comment,
        likes: { like: false, value: 0 },
        replies: [],
      },
    };
    addComment(postId, newComment);
    setComText('');
  };

  return (
    <BlankCard>
      <Box p={3}>
        {/* 🧍 Kullanıcı bilgisi */}
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar alt={post.profile.name} src={post.profile.avatar} />
          <Typography variant="h6">{post.profile.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            <IconCircle size="7" strokeOpacity="0.1" /> {post.profile.time}
          </Typography>
        </Stack>

        {/* 📄 İçerik */}
        <Box py={2}>{post.data.content}</Box>

        {/* 🖼️ Görseller */}
        {post.data.images.length > 0 && (
          <Grid container spacing={3} mb={2}>
            {post.data.images.map((photo) => (
              <Grid
                key={photo.img}
                size={{
                  xs: 12,
                  sm: 12,
                  lg: photo.featured ? 12 : 6,
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    borderRadius: isBorderRadius / 4,
                    height: 360,
                    width: '100%',
                    objectFit: 'cover',
                  }}
                  image={photo.img}
                  alt="post-image"
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* 🎬 Video */}
        {post.data.video && (
          <CardMedia
            sx={{
              borderRadius: isBorderRadius / 4,
              height: 300,
              mb: 2,
            }}
            component="iframe"
            src={`https://www.youtube.com/embed/${post.data.video}`}
          />
        )}

        {/* ❤️ Beğeni / Yorum / Paylaş */}
        <Box>
          <Stack direction="row" gap={1} alignItems="center">
            <Tooltip title="Like" placement="top">
              <Fab
                size="small"
                color={post.data.likes.like ? 'primary' : 'inherit'}
                onClick={() => handleLike(post.id ?? '')}
              >
                <IconThumbUp size="16" />
              </Fab>
            </Tooltip>
            <Typography variant="body1" fontWeight={600}>
              {post.data.likes.value}
            </Typography>

            <Tooltip title="Comment" placement="top">
              <Fab sx={{ ml: 2 }} size="small" color="secondary">
                <IconMessage2 size="16" />
              </Fab>
            </Tooltip>
            <Typography variant="body1" fontWeight={600}>
              {post.data.comments?.length ?? 0}
            </Typography>

            <Tooltip title="Share" placement="top">
              <IconButton sx={{ ml: 'auto' }}>
                <IconShare size="16" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* 💬 Yorumlar */}
        <Box>
          {post.data.comments?.map((comment) => (
            <PostComments key={comment.id} comment={comment} post={post} />
          ))}
        </Box>
      </Box>

      <Divider />

      {/* ✍️ Yorum yazma alanı */}
      <Box p={2}>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar
            alt={post.profile.name}
            src={post.profile.avatar}
            sx={{ width: 33, height: 33 }}
          />
          <TextField
            placeholder="Comment"
            value={comText}
            onChange={(e) => setComText(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => post.id && onSubmit(post.id, comText)}
          >
            Comment
          </Button>
        </Stack>
      </Box>
    </BlankCard>
  );
};

export default PostItem;
