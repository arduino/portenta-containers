import React, { useState } from "react";
import copy from "copy-to-clipboard";
import { z } from "zod";
import { BoxProps } from "@mui/material/Box";
import { SvgCopy } from "../../../assets/Copy";
import { Code } from "../../Code";

export const FactoryNameFormSchema = z.object({
  name: z.string().min(1).max(64),
});

export type FactoryNameForm = z.infer<typeof FactoryNameFormSchema>;

interface CopyShellCodeComponentProps extends BoxProps {
  code: string;
}

function CopyShellCodeComponent(props: CopyShellCodeComponentProps) {
  const { code, ...boxProps } = props;
  const [_, setCopied] = useState(false);

  return (
    <>
      <Code
        sx={{
          ...boxProps.sx,
          borderColor: "#58585A",
          backgroundColor: "#111",
          marginX: 0,
          position: "relative",
          lineHeight: "28px",
        }}
      >
        {code}
        <SvgCopy
          onClick={() => {
            copy(code.replace(/^\$\s/, ""));
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 3000);
          }}
          sx={{
            position: "absolute",
            width: 24,
            height: 24,
            right: 8,
            top: 8,
            cursor: "pointer",
          }}
        />
      </Code>
    </>
  );
}

export const CopyShellCode = React.memo(CopyShellCodeComponent);
