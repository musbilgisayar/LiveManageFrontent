"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import "./carousel.css";
import { useTheme } from "@mui/material/styles";

function SampleNextArrow(props: any) {
  const { className, onClick } = props;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      className={className}
      sx={{
        cursor: "pointer",
        position: "absolute",
        top: { xs: "unset ", sm: "-100px" },
        bottom: { xs: "-60px", sm: "unset" },
        right: 0,
        backgroundColor: (theme) => theme.palette.grey[100],
        width: "48px",
        height: "48px",
        borderRadius: "50%",
      }}
      onClick={onClick}
    >
      <IconArrowRight />
    </Box>
  );
}

function SamplePrevArrow(props: any) {
  const { className, onClick } = props;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      className={className}
      sx={{
        cursor: "pointer",
        position: "absolute",
        top: { xs: "unset ", sm: "-100px" },
        bottom: { xs: "-60px", sm: "unset" },
        right: "60px",
        backgroundColor: (theme) => theme.palette.grey[100],
        width: "48px",
        height: "48px",
        borderRadius: "50%",
      }}
      onClick={onClick}
    >
      <IconArrowLeft />
    </Box>
  );
}

const LeaderShipCarousel = () => {
  const theme = useTheme();

  const slideStyle = {
    padding: "0 30px",
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    className: "slider variable-width",
    centerMode: false,
    slidesToScroll: 4,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const UserBox = styled(Box)(() => ({
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.default
        : "white",
    maxWidth: "calc(100% - 51px)",
    marginLeft: "15px",
    borderRadius: "8px",
    marginTop: "-30px !important",
    boxShadow: "0px 6px 12px rgba(127, 145, 156, 0.12)",
    marginBottom: "10px",
  }));

  return (
    <Box marginLeft="15px">
      <Slider {...settings} className="leadership-carousel">
        {[
          { src: "user1.jpg", name: "Alex Martinez", title: "CEO & Co-Founder" },
          { src: "user2.jpg", name: "Jordan Nguyen", title: "CTO & Co-Founder" },
          { src: "user3.jpg", name: "Taylor Roberts", title: "Product Manager" },
          { src: "user4.jpg", name: "Morgan Patel", title: "Lead Developer" },
          { src: "user5.jpg", name: "Kiana Collins", title: "Software Developer" },
          { src: "user1.jpg", name: "Alex Martinez", title: "CEO & Co-Founder" },
          { src: "user2.jpg", name: "Jordan Nguyen", title: "CTO & Co-Founder" },
          { src: "user3.jpg", name: "Taylor Roberts", title: "Product Manager" },
          { src: "user4.jpg", name: "Morgan Patel", title: "Lead Developer" },
        ].map((user, index) => (
          <div style={slideStyle} key={index}>
            <Image
              src={`/images/frontend-pages/homepage/${user.src}`}
              alt="user-img"
              width={270}
              height={290}
              style={{ objectFit: "cover", borderRadius: "16px" }}
            />
            <UserBox
              bgcolor="white"
              px="10px"
              py="16px"
              textAlign="center"
              position="relative"
              zIndex="1"
            >
              <Typography variant="h5" mb={1}>
                {user.name}
              </Typography>
              <Typography variant="body1">{user.title}</Typography>
            </UserBox>
          </div>
        ))}
      </Slider>
    </Box>
  );
};

export default LeaderShipCarousel;
