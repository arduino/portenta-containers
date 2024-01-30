import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SvgArrowRight } from "../../../assets/ArrowRight";
import { useTouchSelectAll } from "../../../hooks/useTouchSelectAll";
import { useReadFactoryNameQuery } from "../../../services/factory";
import { TooltipIcon } from "../../TooltipIcon";
import { StatusKeyValue } from "../StatusKeyValue";

function FactoryNameRowComponent() {
  const selectAll = useTouchSelectAll();

  const { data: factoryNameInfo, isLoading: factoryNameIsLoading } =
    useReadFactoryNameQuery(undefined, {
      pollingInterval: 12000,
    });

  if (!factoryNameInfo?.registrationComplete) {
    return null;
  }

  return (
    <StatusKeyValue
      keyName="Factory name"
      keyNameMobile="Factory"
      value={
        factoryNameInfo?.registrationComplete
          ? factoryNameInfo.factoryName ?? "Unknown"
          : undefined
      }
      status={
        factoryNameInfo?.registrationComplete
          ? "g"
          : factoryNameInfo?.authenticationPending
            ? "y"
            : "r"
      }
      loading={factoryNameIsLoading}
      renderValue={(value) =>
        value ? (
          <>
            <Box
              component="span"
              onTouchStart={selectAll}
              sx={{
                marginX: 3,
                textTransform: "uppercase",
              }}
            >
              {value}
            </Box>
            <TooltipIcon
              icon={<SvgArrowRight />}
              href={`${import.meta.env.VITE_FOUNDRIES_FACTORY}`}
              target="_blank"
              rel="noopener noreferrer"
              tooltip={"Go to Factory"}
              backgroundColor="#202020"
            />
          </>
        ) : (
          <Button
            component={Link}
            to="/factory"
            color="primary"
            variant="text"
            size="small"
            sx={{
              paddingX: 1,
              fontSize: "inherit",
              marginX: 3,
            }}
          >
            {"Not configured"}
          </Button>
        )
      }
    />
  );
}

export const FactoryNameRow = React.memo(FactoryNameRowComponent);
