import React from "react";
import LegalDocPage from "../legal/LegalDocPage";
import { legalDocList } from "../legal/config";

const LegalPage = () => {
  const defaultDocKey = legalDocList[0]?.key;
  return <LegalDocPage docKey={defaultDocKey} />;
};

export default LegalPage;
