function SketchBackdrop() {
  return (
    <div className="sketch-backdrop" aria-hidden="true">
      <svg
        viewBox="0 0 1600 1200"
        className="sketch-backdrop__art"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="backdropGlow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <path
          className="sketch-backdrop__cloud"
          d="M420 182C516 118 633 96 742 114C848 131 910 179 986 190"
        />
        <path
          className="sketch-backdrop__cloud sketch-backdrop__cloud--right"
          d="M912 175C1014 122 1128 98 1255 112C1356 123 1426 168 1494 180"
        />

        <path
          className="sketch-backdrop__street"
          d="M198 978C338 850 512 776 728 760C946 744 1124 788 1432 966"
        />
        <path
          className="sketch-backdrop__street sketch-backdrop__street--soft"
          d="M282 1008C426 915 582 861 754 856C940 852 1088 901 1368 1036"
        />

        <g className="sketch-backdrop__buildings">
          <path d="M92 978V302l108-42 92 30v688" />
          <path d="M250 986V260l118-48 110 36v738" />
          <path d="M418 990V220l132-34 102 38v766" />
          <path d="M600 994V176l124-28 106 34v812" />
          <path d="M780 982V148l112-24 116 30v828" />
          <path d="M968 1002V208l120-34 116 40v752" />
          <path d="M1174 1002V196l126-32 102 34v804" />
          <path d="M1378 992V284l102-44 82 26v726" />

          <path d="M140 430h96M140 492h96M140 554h96M140 616h96M140 678h96M140 740h96" />
          <path d="M312 374h98M312 438h98M312 502h98M312 566h98M312 630h98M312 694h98M312 758h98" />
          <path d="M498 336h102M498 404h102M498 472h102M498 540h102M498 608h102M498 676h102M498 744h102" />
          <path d="M686 312h100M686 378h100M686 444h100M686 510h100M686 576h100M686 642h100M686 708h100" />
          <path d="M864 332h98M864 398h98M864 464h98M864 530h98M864 596h98M864 662h98M864 728h98" />
          <path d="M1054 352h94M1054 418h94M1054 484h94M1054 550h94M1054 616h94M1054 682h94" />
          <path d="M1240 368h98M1240 436h98M1240 504h98M1240 572h98M1240 640h98M1240 708h98" />
          <path d="M1428 444h62M1428 502h62M1428 560h62M1428 618h62M1428 676h62" />
        </g>

        <g className="sketch-backdrop__details">
          <path d="M136 286c18-18 48-26 78-22" />
          <path d="M287 234c16-16 42-22 68-20" />
          <path d="M462 206c14-18 38-26 62-24" />
          <path d="M650 166c18-20 42-28 70-24" />
          <path d="M842 140c18-16 42-22 66-18" />
          <path d="M1034 188c18-18 46-28 78-26" />
          <path d="M1236 150c18-18 42-26 68-22" />
          <path d="M1410 242c16-14 34-20 54-18" />
        </g>

        <path
          className="sketch-backdrop__face"
          d="M1260 390c-46 4-82 40-84 90-2 62 42 100 108 108 30 4 46 18 62 38 20-16 44-22 68-22 26 0 50 8 70 22-14-30-18-56-16-84 4-66-30-120-92-144-36-14-74-14-116-8Z"
        />
        <path
          className="sketch-backdrop__face-line"
          d="M1308 448c30 2 58 18 72 42"
        />
        <path
          className="sketch-backdrop__face-line"
          d="M1312 520c24 10 38 24 48 44"
        />
        <path
          className="sketch-backdrop__face-line sketch-backdrop__face-line--small"
          d="M1240 414c18 8 30 20 38 36"
        />

        <path
          className="sketch-backdrop__awning"
          d="M112 756c52-54 104-76 170-76 72 0 124 22 168 66"
        />
        <path
          className="sketch-backdrop__awning sketch-backdrop__awning--right"
          d="M1140 760c44-52 94-76 164-76 72 0 126 20 176 66"
        />
        <path
          className="sketch-backdrop__awning sketch-backdrop__awning--bottom"
          d="M466 918c108-46 216-66 324-60 122 8 228 42 360 112"
        />

        <g className="sketch-backdrop__glow-group">
          <circle cx="274" cy="702" r="42" className="sketch-backdrop__glow" />
          <circle cx="1112" cy="722" r="50" className="sketch-backdrop__glow" />
          <circle
            cx="726"
            cy="332"
            r="70"
            className="sketch-backdrop__glow sketch-backdrop__glow--soft"
          />
          <circle
            cx="1220"
            cy="612"
            r="34"
            className="sketch-backdrop__glow sketch-backdrop__glow--small"
          />
        </g>

        <g className="sketch-backdrop__figures">
          <path d="M166 920c14-12 24-20 36-20 18 0 32 16 40 40" />
          <path d="M212 910c10 10 18 26 20 44" />
          <path d="M300 854c8 12 14 30 14 50" />
          <path d="M1226 842c14-12 24-18 38-18 20 0 34 14 42 40" />
          <path d="M1280 836c8 10 12 24 12 40" />
          <path d="M1318 880c12 10 18 24 20 44" />
          <path d="M822 858c10 14 16 28 18 44" />
          <path d="M872 842c12 10 18 28 20 50" />
        </g>
      </svg>
    </div>
  );
}

export default SketchBackdrop;
