import React, { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { BoxProps } from "@mui/system";
import { SvgCircle } from "../../assets/Circle";
import { SvgMinus } from "../../assets/Minus";
import { SvgPlus } from "../../assets/Plus";
import { Copy } from "../Copy";
import { TooltipIcon } from "../TooltipIcon";

interface StatusKeyValueProps extends BoxProps {
  status: "r" | "g" | "y" | "";
  keyName: string;
  value: string | undefined;
  renderValue?: (value: string | undefined) => React.ReactNode;
  loading?: boolean;
  details?: Array<{
    keyName: string;
    value: string | undefined;
  }>;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const WIDTH = 496;

function StatusKeyValueComponent(props: StatusKeyValueProps) {
  const {
    status,
    keyName,
    value,
    details,
    loading,
    renderValue,
    open,
    onOpen,
    onClose,
    ...boxProps
  } = props;
  const [sOpen, setSOpen] = useState(false);

  if (loading) {
    return <Skeleton height={26} sx={{ marginBottom: 1 }} />;
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
          {details ? (
            <>
              <b>{value}</b>
              {open ?? sOpen ? (
                <TooltipIcon
                  tooltip="Show less"
                  icon={<SvgMinus />}
                  backgroundColor="#202020"
                  onClick={() => {
                    if (onClose) {
                      onClose();
                    } else {
                      setSOpen((o) => !o);
                    }
                  }}
                />
              ) : (
                <TooltipIcon
                  tooltip="More info"
                  icon={<SvgPlus />}
                  backgroundColor="#202020"
                  onClick={() => {
                    if (onOpen) {
                      onOpen();
                    } else {
                      setSOpen((o) => !o);
                    }
                  }}
                />
              )}
            </>
          ) : renderValue ? (
            renderValue(value)
          ) : (
            value
          )}
        </Typography>
      </Box>
      {details && !loading ? (
        <Collapse in={open ?? sOpen} collapsedSize={0}>
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
                <Copy value={`${detail.value}`} backgroundColor="#202020">
                  <Box sx={{ marginRight: "2em" }}>{detail.value}</Box>
                </Copy>
              </Typography>
            </Box>
          ))}
        </Collapse>
      ) : null}
    </>
  );
}

export const StatusKeyValue = React.memo(StatusKeyValueComponent);
