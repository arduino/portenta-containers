import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { PageBox } from "../PageBox";

function HomeComponent() {
  return (
    <PageBox>
      <Typography variant="h3" component="h1">
        Welcome to the <b>Arduino Portenta X8</b>
      </Typography>
      <Typography
        variant="h3"
        sx={{
          mt: 9,
        }}
      >
        Would you like to connect to the Arduino Cloud Pro?
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 9 }}>
        <Button component={Link} to="/landing" variant="outlined">
          SKIP
        </Button>
        {/* FIXME: link */}
        <Button
          component="a"
          href="https://www.arduino.cc/pro"
          variant="contained"
          sx={{ ml: 6 }}
        >
          SUBSCRIBE TO PRO
        </Button>
      </Box>
    </PageBox>
  );
}

export const Home = React.memo(HomeComponent);
