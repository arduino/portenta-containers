import React from "react";
import Box from "@mui/material/Box";
import { BoardHostname } from "../../../entities";
import { Copy } from "../../Copy";
import { StatusKeyValue } from "../StatusKeyValue";

function HostnameRowComponent(props: {
  hostname?: BoardHostname;
  hostnameIsLoading: boolean;
}) {
  const { hostname, hostnameIsLoading } = props;

  if (!hostname?.hostname) {
    return null;
  }

  return (
    <StatusKeyValue
      keyName="Hostname"
      value={hostname?.hostname}
      status="g"
      loading={hostnameIsLoading}
      renderValue={(value) => (
        <Copy value={`${value}`} backgroundColor="#202020">
          <Box component="b">{value}</Box>
        </Copy>
      )}
      sx={{ marginBottom: 2 }}
    />
  );
}

export const HostnameRow = React.memo(HostnameRowComponent);
