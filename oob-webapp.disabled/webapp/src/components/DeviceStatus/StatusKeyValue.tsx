import React, { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { BoxProps } from "@mui/system";
import { SvgCircle } from "../../assets/Circle";
import { SvgMinus } from "../../assets/Minus";
import { SvgPlus } from "../../assets/Plus";

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

const WIDTH = 480;

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
          width: WIDTH,
          display: "flex",
          position: "relative",
          alignItems: "baseline",
          marginBottom: 1,
          ...boxProps.sx,
        }}
      >
        {status !== "" ? (
          <SvgCircle
            sx={{
              height: 9,
              width: 9,
              marginY: 1,
              marginRight: 1,
              color:
                status === "r"
                  ? "error.main"
                  : status === "g"
                  ? "success.main"
                  : "warning.main",
            }}
          />
        ) : null}
        <Typography
          variant="body1"
          sx={{
            marginRight: "auto",
            fontFamily: "Roboto Mono",
            fontSize: 16,
            letterSpacing: "0.12em",
            minWidth: 190,
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
              right: -28,
              top: 0,
              cursor: "pointer",
              img: {
                width: 12.5,
                height: 12.5,
              },
              svg: {
                height: 12.5,
                marginLeft: 1.5,
              },
            }}
          >
            {open ? (
              <Tooltip title="Show less">
                <SvgMinus />
              </Tooltip>
            ) : (
              <Tooltip title="Show more">
                <SvgPlus />
              </Tooltip>
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
                width: WIDTH,
                display: "flex",
                position: "relative",
                mb: 1,
                paddingLeft: "17px",
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
