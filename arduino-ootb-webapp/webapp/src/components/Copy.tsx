import React, { useState } from "react";
import copy from "copy-to-clipboard";
import Box, { BoxProps } from "@mui/material/Box";
import { SvgCopy } from "../assets/Copy";
import { useTouchSelectAll } from "../hooks/useTouchSelectAll";

interface CopyProps extends BoxProps {
  value: string;
  backgroundColor?: string;
  children: React.ReactNode | React.ReactNode[];
}

function CopyComponent(props: CopyProps) {
  const { value, children, backgroundColor } = props;
  const [copied, setCopied] = useState(false);

  const selectAll = useTouchSelectAll();

  return (
    <>
      <Box
        className="Oob-Copy"
        component="span"
        tabIndex={0}
        onTouchStart={selectAll}
        sx={{
          display: "flex",
          "&:hover,&:focus": {
            "&+div .copy": {
              opacity: 1,
            },
          },
        }}
      >
        {children}
      </Box>
      <Box
        component="div"
        sx={{
          position: "relative",
          display: {
            xs: "none",
            md: "block",
          },
          ">.MuiBox-root": {
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            backgroundColor: backgroundColor ?? "#2F2F2F",
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            transition: (theme) =>
              theme.transitions.create(["opacity"], { duration: 200 }),
            border: 0,
            color: "secondary.main",
            fontWeight: 700,
            fontFamily: "Roboto Mono",
            borderRadius: 1,
            "&:hover,&:focus": {
              opacity: 1,
            },
          },
        }}
      >
        {/* <Box
          className="copied"
          sx={{
            pointerEvents: "none",
            zIndex: 101,
            opacity: copied ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(["opacity"], { duration: 200 }),
            svg: { height: 20, marginRight: 1 },
          }}
        >
          <SvgCopy />
          {"Copied!"}
        </Box> */}
        <Box
          component="button"
          className="copy"
          onClick={() => {
            copy(value);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 3000);
          }}
          sx={{
            zIndex: 100,
            opacity: 0,
            svg: { height: 20, marginRight: 1 },
            display: {
              xs: "none",
              md: "block",
            },
          }}
        >
          <SvgCopy />
          {copied ? "Copied!" : "Copy"}
        </Box>
      </Box>
    </>
  );
}

export const Copy = React.memo(CopyComponent);
