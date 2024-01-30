import React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { BoxProps } from "@mui/system";
import { SvgCircle } from "../../assets/Circle";
import { SvgMinus } from "../../assets/Minus";
import { SvgPlus } from "../../assets/Plus";
import { mobileMQ } from "../../theme";
import { Copy } from "../Copy";
import { TooltipIcon } from "../TooltipIcon";

interface StatusKeyValueProps extends BoxProps {
  status: "r" | "g" | "y" | "";
  keyName: string;
  keyNameMobile?: string;
  value: string | undefined;
  renderValue?: (value: string | undefined) => React.ReactNode;
  loading?: boolean;
  details?: Array<{
    keyName: string;
    keyNameMobile?: string;
    value: string | undefined;
  }>;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  link?: React.ReactNode;
}

const WIDTH = 496;

function StatusKeyValueComponent(props: StatusKeyValueProps) {
  const {
    status,
    keyName,
    keyNameMobile,
    value,
    details,
    loading,
    renderValue,
    open,
    onOpen,
    onClose,
    link,
    ...boxProps
  } = props;

  if (loading) {
    return <Skeleton height={26} sx={{ marginBottom: 1, ...boxProps.sx }} />;
  }

  return (
    <>
      <Box
        component="li"
        role="menuitem"
        {...boxProps}
        sx={{
          width: WIDTH,
          display: "flex",
          position: "relative",
          alignItems: "center",
          marginBottom: 1,
          fontSize: 14,
          letterSpacing: "1.5px",
          ...boxProps.sx,
          "li:focus": {
            border: "2px solid red",
          },
          [mobileMQ]: {
            width: "100%",
          },
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
            [mobileMQ]: {
              minWidth: 0,
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
            {keyName}
          </Box>
          <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
            {keyNameMobile ?? keyName}
          </Box>
        </Typography>
        {details ? (
          <>
            {renderValue ? renderValue(value) : value}
            {open ? (
              <TooltipIcon
                tooltip="Show less"
                icon={<SvgMinus />}
                backgroundColor="#202020"
                onClick={() => {
                  if (onClose) {
                    onClose();
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
      </Box>
      {details && !loading ? (
        <Collapse
          component="ul"
          role="menu"
          in={open}
          collapsedSize={0}
          unmountOnExit
          sx={{
            padding: 0,
            [mobileMQ]: { paddingRight: 4 },
          }}
        >
          {details.map((detail) => (
            <Box
              component="li"
              role="menuitem"
              key={detail.keyName}
              sx={{
                width: WIDTH,
                display: "flex",
                position: "relative",
                mb: 1,
                paddingLeft: "17px",
                [mobileMQ]: {
                  width: "100%",
                },
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
                <Box
                  component="span"
                  sx={{ display: { xs: "none", md: "inline" } }}
                >
                  {detail.keyName}
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: "inline", md: "none" } }}
                >
                  {detail.keyNameMobile ?? detail.keyName}
                </Box>
              </Typography>
              <Copy
                value={`${detail.value}`}
                backgroundColor="#202020"
                sx={{
                  paddingRight: 5,
                }}
              >
                <Box
                  component="code"
                  sx={{
                    fontFamily: "Roboto Mono",
                    fontSize: 14,
                    letterSpacing: "1.5px",
                  }}
                >
                  {detail.value}
                </Box>
              </Copy>
            </Box>
          ))}
          {link ? (
            <Box
              sx={{
                width: WIDTH,
                position: "relative",
                mb: 1,
                paddingLeft: "17px",
                [mobileMQ]: {
                  width: "100%",
                },
                display: "flex",
                justifyContent: "flex-end",
                fontSize: 14,
              }}
            >
              {link}
            </Box>
          ) : null}
        </Collapse>
      ) : null}
    </>
  );
}

export const StatusKeyValue = React.memo(StatusKeyValueComponent);
