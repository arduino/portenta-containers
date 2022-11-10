import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SvgEthernet from "../../../assets/Ethernet";
import { useReadEthernetConnectionQuery } from "../../../services/networking";
import { BackTitle } from "../../BackTitle";
import { DeviceStatus } from "../../DeviceStatus";
import { PageBox } from "../../PageBox";

function EthernetConnectionComponent() {
  const [dots, setDots] = useState(0);
  const navigate = useNavigate();
  const { data: ethernetConnection } = useReadEthernetConnectionQuery();

  useEffect(() => {
    if (ethernetConnection?.connected) {
      navigate("/");
    }
  }, [ethernetConnection?.connected, navigate]);

  useEffect(() => {
    const i = setInterval(() => {
      setDots((d) => (d + 1) % 3);
    }, 1000);

    return () => clearInterval(i);
  }, []);

  return (
    <>
      <PageBox>
        <BackTitle back="/" title="Ethernet Connection" />
        <Typography textAlign="center" sx={{ marginTop: 6 }}>
          {`Connect Portenta X8 through an ethernet cable. You will need a USB-C hub with an ethernet socket avaliable.`}
        </Typography>
        <Box
          sx={{
            fontSize: 64,
            color: "secondary.main",
            marginY: 2,
            paddingY: 1.5,
          }}
        >
          <SvgEthernet />
        </Box>
        <Typography textAlign="left" sx={{ width: "100%" }}>
          {`Waiting connection${Array.from(new Array(dots + 1))
            .map(() => ".")
            .join("")}`}
        </Typography>
      </PageBox>
      <DeviceStatus />
    </>
  );
}

export const EthernetConnection = React.memo(EthernetConnectionComponent);
