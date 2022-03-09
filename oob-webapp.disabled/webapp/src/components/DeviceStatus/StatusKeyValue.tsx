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
}

const WIDTH = 496;

function StatusKeyValueComponent(props: StatusKeyValueProps) {
  const { status, keyName, value, details, loading, renderValue, ...boxProps } =
    props;
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
          {details ? (
            <>
              <b>{value}</b>
              {open ? (
                <TooltipIcon
                  tooltip="Show less"
                  icon={<SvgMinus />}
                  backgroundColor="#202020"
                  onClick={() => setOpen((o) => !o)}
                />
              ) : (
                <TooltipIcon
                  tooltip="More info"
                  icon={<SvgPlus />}
                  backgroundColor="#202020"
                  onClick={() => setOpen((o) => !o)}
                />
              )}
            </>
          ) : renderValue ? (
            renderValue(value)
          ) : (
            value
          )}
          {/* {details ? (
            <InlineIcon
              onClick={() => setOpen((o) => !o)}
              sx={{
                // position: "absolute",
                // right: -28,
                // top: 0,
                marginLeft: 2,
                cursor: "pointer",
                fontSize: "14px",
                // img: {
                //   width: 12.5,
                //   height: 12.5,
                // },
                // svg: {
                //   height: 12.5,
                //   marginLeft: 1.5,
                // },
              }}
            >
              {open ? (
                <ActionTooltip
                  tooltipText="Show less"
                  icon={<SvgMinus sx={{ color: "secondary.main" }} />}
                  backgroundColor="#202020"
                  onClick={() => setOpen((o) => !o)}
                >
                  <SvgMinus />
                </ActionTooltip>
              ) : (
                <ActionTooltip
                  tooltipText="More info"
                  icon={<SvgPlus sx={{ color: "secondary.main" }} />}
                  backgroundColor="#202020"
                  onClick={() => setOpen((o) => !o)}
                >
                  <SvgPlus />
                </ActionTooltip>
              )}
            </InlineIcon>
          ) : null} */}
        </Typography>
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
                <Copy value={`${detail.value}`} backgroundColor="#202020">
                  <Box sx={{ marginRight: "1em" }}>{detail.value}</Box>
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
