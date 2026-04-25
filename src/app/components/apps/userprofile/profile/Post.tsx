'use client';
import React, { useContext } from 'react';
import Grid from '@mui/material/Grid'; // ✅ MUI 7 System Grid
import PostItem from './PostItem';
import { PostTextBox } from './PostTextBox';
import { UserDataContext } from '@/app/context/UserDataContext';

const Post = () => {
  const { posts = [] } = useContext(UserDataContext) ?? {};

  return (
    <Grid container spacing={3}>
      {/* Yeni gönderi kutusu */}
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <PostTextBox />
      </Grid>

      {/* Gönderi listesi */}
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <Grid
            key={post.id}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <PostItem post={post} />
          </Grid>
        ))
      ) : (
        <Grid
          size={{
            xs: 12,
          }}
        >
          <p style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>
            No posts available
          </p>
        </Grid>
      )}
    </Grid>
  );
};

export default Post;
