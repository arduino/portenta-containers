import React from "react";
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
        {details ? (
          <>
            {/* <Typography
              variant="body2"
              component="b"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "Roboto Mono",
                marginX: 2,
              }}
            > */}
            {renderValue ? renderValue(value) : value}
            {/* </Typography> */}
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
          sx={{ padding: 0 }}
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
              <Copy
                value={`${detail.value}`}
                backgroundColor="#202020"
                sx={{
                  paddingRight: 5,
                }}
              >
                <Box
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
        </Collapse>
      ) : null}
    </>
  );
}

export const StatusKeyValue = React.memo(StatusKeyValueComponent);
