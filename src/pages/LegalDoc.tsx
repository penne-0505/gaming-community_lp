import React from "react";
import { useParams } from "react-router-dom";
import LegalDocPage from "../legal/LegalDocPage";

const LegalDoc = () => {
  const { docKey } = useParams();
  return <LegalDocPage docKey={docKey ?? ""} />;
};

export default LegalDoc;
