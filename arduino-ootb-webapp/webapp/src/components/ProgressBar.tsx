import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";

interface ProgressBarProps {
  percentage?: number;
}

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#58585A",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#DEF154",
  },
}));

export default function ProgressBar(props: ProgressBarProps) {
  const { percentage } = props;

  if (!percentage || percentage === 0) return null;
  return (
    <Box sx={{ flexGrow: 1, padding: "24px 0 12px 0" }}>
      {percentage && (
        <BorderLinearProgress
          variant={percentage === 100 ? "indeterminate" : "determinate"}
          value={percentage}
        />
      )}
    </Box>
  );
}
