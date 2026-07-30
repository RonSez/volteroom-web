/**
 * SGS RoHS test reports commissioned by Volteroom (SGS job NBP26-003558).
 *
 * The PDFs live in `public/certificates/` and are served straight from the
 * base URL. `id` is the SGS report number and doubles as the message key for
 * the sample name under the `certificates.samples` namespace.
 */
export type Certificate = {
  id: string;
  /** Path under `public/`. */
  file: string;
  pages: number;
  bytes: number;
};

/** Every report in this batch was issued on the same date. */
export const certificatesIssued = "2026-07-16";

/** Ordered by product family rather than report number. */
export const certificates: Certificate[] = [
  {
    id: "NGBEC26003487302",
    file: "/certificates/sgs-rohs-switch-NGBEC26003487302.pdf",
    pages: 22,
    bytes: 15416868,
  },
  {
    id: "NGBEC26003492502",
    file: "/certificates/sgs-rohs-flush-type-switch-NGBEC26003492502.pdf",
    pages: 10,
    bytes: 3697842,
  },
  {
    id: "NGBEC26003488202",
    file: "/certificates/sgs-rohs-socket-outlet-NGBEC26003488202.pdf",
    pages: 16,
    bytes: 8050246,
  },
  {
    id: "NGBEC26003490702",
    file: "/certificates/sgs-rohs-socket-outlet-usb-NGBEC26003490702.pdf",
    pages: 12,
    bytes: 4563431,
  },
  {
    id: "NGBEC26003492002",
    file: "/certificates/sgs-rohs-usb-power-supply-NGBEC26003492002.pdf",
    pages: 11,
    bytes: 4713346,
  },
  {
    id: "NGBEC26003493702",
    file: "/certificates/sgs-rohs-telecommunications-outlet-NGBEC26003493702.pdf",
    pages: 24,
    bytes: 15137148,
  },
  {
    id: "NGBEC26003492702",
    file: "/certificates/sgs-rohs-thermostat-NGBEC26003492702.pdf",
    pages: 10,
    bytes: 4447565,
  },
  {
    id: "NGBEC26003498902",
    file: "/certificates/sgs-rohs-panels-frames-NGBEC26003498902.pdf",
    pages: 8,
    bytes: 978420,
  },
];
