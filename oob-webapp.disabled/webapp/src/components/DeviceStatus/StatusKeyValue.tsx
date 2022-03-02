import React, { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { BoxProps } from "@mui/system";
import minusIcon from "../../assets/minus.svg";
import plusIcon from "../../assets/plus.svg";

interface StatusKeyValueProps extends BoxProps {
  status: "r" | "g" | "y" | "";
  keyName: string;
  value: string | undefined;
  loading?: boolean;
  details?: Array<{
    keyName: string;
    value: string | undefined;
  }>;
}

function StatusKeyValueComponent(props: StatusKeyValueProps) {
  const { status, keyName, value, details, loading, ...boxProps } = props;
  const [open, setOpen] = useState(false);

  if (loading) {
    return <Skeleton height={24} sx={{ mb: 1 }} />;
  }

  return (
    <>
      <Box
        {...boxProps}
        sx={{
          width: 370,
          display: "flex",
          position: "relative",
          ...boxProps.sx,
        }}
      >
        {status !== "" ? (
          <Box
            sx={{
              "&::before": {
                content: '"•"',
                color: (theme) =>
                  status === "r"
                    ? theme.palette.error.main
                    : status === "g"
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                fontWeight: "bold",
                display: "block",
                width: "1em",
                marginLeft: "-1em",
                marginTop: "-0.2em",
                fontSize: "1.5em",
                height: 0,
              },
            }}
          />
        ) : null}
        <Typography
          variant="body1"
          sx={{
            mb: 1,
            mr: "auto",
            fontFamily: "Roboto Mono",
            fontSize: 16,
            letterSpacing: "0.12em",
          }}
        >
          {keyName}
        </Typography>
        <Typography
          variant="body2"
          component="span"
          sx={{
            fontFamily: "Roboto Mono",
            fontSize: 14,
            letterSpacing: "1.5px",
          }}
        >
          <b>{value}</b>
        </Typography>
        {details ? (
          <Box
            onClick={() => setOpen((o) => !o)}
            sx={{
              position: "absolute",
              right: -20,
              top: -2,
              cursor: "pointer",
              img: {
                width: 12.5,
                height: 12.5,
              },
            }}
          >
            {open ? (
              <img src={minusIcon} alt="Show less" />
            ) : (
              <img src={plusIcon} alt="Show more" />
            )}
          </Box>
        ) : null}
      </Box>
      {details && !loading ? (
        <Collapse in={open} collapsedSize={0}>
          {details.map((detail) => (
            <Box
              key={detail.keyName}
              sx={{
                width: 370,
                display: "flex",
                position: "relative",
                mb: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  mb: 0,
                  mr: "auto",
                  fontFamily: "Roboto Mono",
                  fontSize: 14,
                  letterSpacing: "0.1em",
                }}
              >
                {detail.keyName}
              </Typography>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  mb: 0,
                  fontFamily: "Roboto Mono",
                  fontSize: 14,
                  letterSpacing: "1.5px",
                }}
              >
                {detail.value}
              </Typography>
            </Box>
          ))}
        </Collapse>
      ) : null}
    </>
  );
}

export const StatusKeyValue = React.memo(StatusKeyValueComponent);
