import React, { useState, useEffect } from 'react';
import { Printer, Loader2, ArrowLeft } from 'lucide-react';

// Types
type ToothStatus = 'HEALTHY' | 'TREATED' | 'MISSING' | 'CAVITY' | 'CROWN' | 'IMPLANT' | 'BRIDGE' | 'ROOT_CANAL' | 'EXTRACTION_NEEDED';

interface ToothData {
  toothNumber: number;
  status: ToothStatus;
  surfaces?: string[];
  notes?: string;
  lastUpdated?: string;
}

interface ToothPathDefinition {
  id: number;
  label: string;
  path: string;
}

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  notes?: string;
}

interface PatientPrintPageProps {
  patientId: string;
}

const STATUS_CONFIG: Record<ToothStatus, { label: string; fill: string; border: string }> = {
  HEALTHY: { label: 'Sănătos', fill: '#ffffff', border: '#0f172a' },
  CAVITY: { label: 'Carie', fill: 'rgba(225, 29, 72, 0.9)', border: '#be123c' },
  TREATED: { label: 'Tratat', fill: 'rgba(249, 115, 22, 0.9)', border: '#ea580c' },
  CROWN: { label: 'Coroană', fill: 'rgba(59, 130, 246, 0.9)', border: '#2563eb' },
  IMPLANT: { label: 'Implant', fill: 'rgba(139, 92, 246, 0.9)', border: '#7c3aed' },
  BRIDGE: { label: 'Punte', fill: 'rgba(16, 185, 129, 0.9)', border: '#059669' },
  ROOT_CANAL: { label: 'Canal Radicular', fill: 'rgba(245, 158, 11, 0.9)', border: '#d97706' },
  EXTRACTION_NEEDED: { label: 'Extracție Necesară', fill: 'rgba(239, 68, 68, 0.9)', border: '#dc2626' },
  MISSING: { label: 'Lipsă', fill: 'transparent', border: '#6b7280' }
};

const TOOTH_CENTERS: Record<number, number> = {
  18: 187, 17: 173, 16: 158, 15: 146, 14: 135, 13: 125, 12: 117, 11: 110,
  48: 187, 47: 173, 46: 158, 45: 143, 44: 135, 43: 125, 42: 117, 41: 110
};

const GUM_PATH_UPPER = "m 8.7407061,113.07714 c -0.3000405,-4.39918 1.1161915,-8.44413 2.3001859,-12.60502 1.199469,-4.948893 4.07203,-8.828056 7.544609,-12.697029 6.186721,-6.308851 11.055738,-6.485599 20.79368,-7.08457 l 17.849442,-1.380112 31.006507,-1.472121 42.50743,0.276024 24.47398,1.380112 20.42565,2.024163 c 10.63527,1.410834 13.66905,6.553308 17.84944,11.132899 2.34056,4.254022 3.80157,8.699114 5.06041,13.341074 0.35395,3.21803 0.63232,6.36219 0.27602,9.56878 -0.99312,1.27678 -5.14507,0.14353 -7.72862,0 -1.74644,-0.11529 -3.48145,-0.24963 -4.50836,-1.56413 l -1.77115,-1.95516 -1.2421,-1.01208 -2.64853,-0.68977 -1.17106,-1.82165 -4.16378,0.7807 c -2.43241,0.15805 -4.77037,-0.8743 -7.31915,-1.46379 l -0.78071,-0.94336 -2.79754,-0.71565 c -1.65462,2.15407 -3.46789,2.0871 -5.36737,0.81324 l -1.91925,-0.78071 -1.82165,-0.29277 -1.49636,0.52048 -1.17106,0.91082 -0.65059,0.3253 -0.97589,-0.0976 -1.659,-0.16265 -1.26866,0.0651 c -3.34193,-0.71587 -5.48708,-1.27584 -9.95404,-2.24457 l -4.58666,0.52048 -3.1879,-0.0325 -2.50477,0.29276 c -2.47297,0.2065 -5.22756,-2.6218 -7.7095,-1.9192 l -2.37466,0.13012 -4.26137,-0.16265 -1.91924,0.13012 -6.01797,1.17106 -3.44813,-0.84577 -5.59508,0.0651 -1.95177,-0.19518 c 0,0 -2.439718,1.04095 -4.424018,0.35783 L 88.447821,104.062 c -1.89037,-0.80863 -1.65487,-0.78162 -3.936074,0.39035 -2.250505,1.43427 -3.79651,0.60987 -6.050497,0.0976 -5.951416,-0.85019 -2.811329,1.42588 -7.904678,0.94336 l -3.090305,-0.29277 -9.108273,0.61806 c -4.330756,-1.56646 -10.031504,-0.695 -14.703351,-0.68315 0,0 -1.476499,-0.045 -2.472245,1.65901 -1.151992,1.97138 -3.060873,1.99648 -4.781844,2.50477 -6.876713,0.45385 -11.584022,0.40545 -13.95074,3.36385 l -5.014405,3.08225 -2.070167,0.32203 c -7.4118624,-0.5244 -6.7274768,1.86911 -6.6245359,-2.99022 z";
const GUM_PATH_LOWER = "m 12.467007,156.55065 2.392194,0.46004 c 4.529775,0.76354 8.497248,0.40248 12.559014,0.23001 6.111199,2.37744 10.470336,2.31142 15.043216,1.93216 l 2.392193,0.64405 2.760223,-0.046 c 4.44311,3.06114 3.951149,2.88292 8.694703,1.10409 1.423386,-0.99487 2.156751,-0.60553 3.726302,-0.13801 3.163246,1.21496 6.202792,0.57444 9.246745,0 l 1.840148,0.46003 c 3.574321,-0.2024 6.504158,0.76246 9.476767,1.51813 l 1.380111,0.46003 c 2.166894,-0.0888 2.910887,0.0148 4.554368,1.1961 l 2.438197,0.13801 2.760223,-0.32203 c 1.613636,0.19454 3.046739,-0.15253 4.416356,-0.69005 l 5.796473,-0.13801 3.26626,0.18401 c 1.67991,1.55004 3.27,0.83428 5.0144,0 l 2.20819,1.28811 c 1.41266,0.0196 2.7369,0.2692 4.73838,-1.2421 l 1.67913,10e-6 c 0.10509,3.57293 7.43617,-0.45197 7.3376,-0.69005 l 2.20817,-0.32202 c 0.39923,1.14777 7.45262,-0.82149 8.97073,-0.96608 l 1.93216,-0.18402 c 2.22282,0.94613 4.94168,0.40201 7.22258,-0.23002 l 1.65613,-0.46003 2.71422,0.36803 c 0,0 0.3648,-0.71364 3.03625,0.36803 0.87822,0.35559 1.8523,0.42357 2.85223,0.41403 l 3.6803,-1.1961 c 0,0 -0.32203,0.35426 2.30018,-0.59804 2.46812,-0.89634 2.80623,-0.092 2.80623,-0.092 0,0 0.59944,-0.53309 4.23234,0.92007 1.64895,0.65958 9.58624,-2.59807 8.97072,-2.62221 l 2.34619,0.092 c 3.98699,0.49015 7.97398,-0.24057 11.96097,-1.33411 5.18998,0.51822 4.41874,2.84065 5.75046,7.4066 0.901,5.61982 2.96145,10.58917 0.59805,16.1473 -0.53372,1.62547 -1.92802,3.25093 -5.15241,4.8764 -5.5803,3.54518 -12.38289,5.10159 -18.76952,6.57853 l -8.09665,1.74814 -9.24675,1.10409 -16.46933,0.23002 -29.07435,-0.046 -25.9921,0.23002 -15.043216,-0.18401 -17.941451,0.092 -6.670537,-0.64406 c -6.320412,-0.92963 -12.387757,-2.42866 -18.217473,-4.46236 -5.026602,-2.00291 -10.240898,-3.44273 -14.813197,-6.80855 -2.655274,-2.8462 -5.7211961,-5.18319 -5.4284383,-11.68494 -0.1309464,-11.30751 1.298398,-15.54466 3.9563193,-15.08924 z";
// PLACEHOLDER - Aici vei adăuga path-urile tale complete
const TEETH_UPPER: ToothPathDefinition[] = [
    { id: 18, label: "Molar 3 Sus", path: "m 183.85696,96.182043 2.08189,0.772048 1.78913,1.286745 1.49636,1.833614 1.106,1.83361 1.07347,2.28398 0.42289,1.83361 0.3253,2.67 0.0651,2.73434 c 1.47278,2.55418 0.83364,5.23095 0.43916,7.96174 -0.11201,0.68809 -0.48072,1.12232 -0.74819,1.65668 -0.36602,0.70735 -1.00751,1.05888 -1.53526,0.26642 -0.64342,-1.33 -0.8135,-0.41036 -1.92946,-0.35628 -0.70368,-0.0294 -1.19798,-1.81969 -2.11439,-1.84823 -0.76188,-0.0237 -1.78849,1.63974 -2.38501,1.96293 -0.22655,0.12274 -1.04153,0.4524 -1.76998,0.29181 -0.37473,-0.0826 -0.95151,-0.19125 -1.30176,-0.74494 -0.36501,-0.57704 -0.49586,-1.59828 -0.49586,-1.59828 l 0.13012,-4.60012 0.52047,-5.59735 0.58553,-2.83084 c 1.03052,-2.26267 0.66682,-3.94171 0.22771,-6.272885 -0.21168,-0.708271 -0.28577,-2.240903 0.21803,-2.903806 0.59231,-0.779371 1.79875,-0.634796 1.79875,-0.634796 z" },
    { id: 17, label: "Molar 2 Sus", path: "m 169.79972,91.563498 0.87407,0.909865 0.18401,6.096109 -0.046,5.004268 0.50604,1.91072 0.36803,0.63691 0.82807,-0.7279 0.64405,-3.18453 0.18402,-6.960483 0.73605,-2.729599 c 0.43876,-1.082183 1.33217,-0.754725 2.02417,-0.136481 2.1197,2.290824 2.50955,5.125016 2.80623,8.052323 l 0.092,7.82486 0.58769,1.08222 c 0.27214,0.67895 0.40362,1.37341 0.5651,2.03426 l 0.24358,1.72718 c 0.0511,0.65012 -0.0805,4.55132 -1.16794,5.75732 -0.44865,0.49757 -1.65454,0.18094 -1.65454,0.18094 -0.3383,-0.16684 -0.61761,-0.3455 -0.91517,-0.35596 -0.32677,-0.0115 -0.82672,0.21297 -1.21751,0.27578 l -0.8624,-0.0418 -0.54721,-0.28745 c -0.71993,-1.87406 -1.29032,-1.41165 -1.79414,0.091 -0.2952,0.18846 -0.64373,0.23188 -1.02556,0.18473 -0.30141,-0.22945 -1.16194,-0.30609 -1.65676,-0.31248 -0.57307,-0.007 -0.86819,0.57675 -1.40326,0.52524 -0.86588,-0.0833 -1.49276,-1.08577 -1.48087,-1.07989 l -0.39407,-0.9545 -0.24998,-1.27468 0.17251,-2.97981 0.50767,-2.79953 0.60792,-1.68157 -0.41404,-4.45835 0.32203,-5.732158 0.92007,-4.412854 0.73606,-1.910721 z" },
    { id: 16, label: "Molar 1 Sus", path: "m 153.21413,92.000118 3.02525,5.243492 1.20359,2.92735 c 1.05338,4.72941 1.64202,1.73794 2.27707,-0.482533 l 1.56142,-2.86301 V 94.31626 l -0.52047,-1.15807 0.0651,-1.222409 0.42288,-0.707711 c 0.58553,-0.499403 1.17107,-0.208137 1.7566,0.22518 l 1.49636,1.897953 1.07347,2.702164 0.19518,1.576265 0.16264,3.088188 -0.32529,2.34832 -1.07348,3.18469 1.07348,2.31614 0.61806,2.47699 -0.35782,4.85747 -0.97589,1.76928 -0.94336,0.35385 c 0,0 -2.17948,0.6112 -3.12283,-0.0643 l -0.94336,-0.67554 -1.4313,-0.48253 -1.56142,0.57904 -1.39877,0.48253 -2.37465,0.0322 -1.07348,-0.54687 -0.78071,-1.31892 -0.48794,-1.76927 c 0,0 -0.25015,-1.88642 -0.26024,-2.60566 -0.0749,-5.33759 2.75331,-1.542 0.91083,-8.33168 0,0 -0.3253,-1.5441 -0.13012,-3.731568 l 0.19518,-2.18747 -0.35783,-2.026626 -0.26023,-1.511925 -0.0325,-1.318915 0.0651,-0.289519 c 0.60641,-0.853414 1.35632,-1.032767 2.30948,-0.257419 z" },
    { id: 15, label: "Premolar 2 Sus", path: "m 142.42751,95.687731 -0.046,-2.85223 0.32202,-2.392193 0.50842,-1.288916 0.64167,-0.689244 0.44503,-0.363485 0.70507,-0.234563 0.62211,0.19405 0.38997,0.634016 0.41403,3.128254 0.52596,0.931796 0.60229,0.922306 1.72398,2.930284 0.78206,2.254181 0.32203,3.772303 -0.27602,5.33643 0.69005,6.80855 0.25079,1.82326 -0.33491,1.66744 -0.34887,0.59182 -0.47688,0.2632 -1.57434,0.0246 c -2.12839,1.20959 -3.17874,1.39098 -4.73721,-0.4569 l -1.16889,0.61187 -1.18279,-0.0354 -0.29284,-0.11693 -0.17974,-0.27253 -0.16715,-0.69622 -0.23002,-3.58829 0.046,-3.17426 0.50603,-3.86431 -0.23001,-2.34619 0.092,-2.07017 0.55205,-3.220256 0.69006,-2.162174 z" },
    { id: 14, label: "Premolar 1 Sus", path: "m 132.81273,86.76301 0.57424,-0.608178 0.67384,0.0016 0.54606,0.560528 0.50605,2.116172 0.69005,5.93448 2.11617,4.370353 0.64405,2.208175 v 2.4382 c -0.37097,1.9625 0.10216,2.84451 0.96608,4.50836 l 0.50605,3.95632 0.0567,2.38661 -0.38302,2.44214 -0.50501,0.31856 c -1.17353,0.2836 -1.60946,-0.19417 -2.66542,-0.64173 -1.04978,0.5698 -1.58914,0.83575 -2.66611,0.48994 -0.75959,-0.88986 -1.59898,-0.66253 -2.48853,0.26707 l -0.61493,0.21702 -0.67047,-0.14322 c -1.26001,-1.69191 -0.9682,-3.68219 -1.05808,-5.70446 l 0.36803,-2.71422 c 0.67162,-2.07753 1.19747,-2.64989 0.41403,-5.52045 l 0.13801,-2.76022 0.78206,-2.760219 1.01209,-3.036245 0.50604,-5.428437 0.18401,-2.070169 z" },
    { id: 13, label: "Canin Sus", path: "m 122.46189,81.242563 0.66338,-1.428875 0.50913,-0.107622 0.56439,0.244449 0.51729,0.970024 1.47212,2.806226 0.32202,3.542287 -0.13801,3.726301 c 0.59298,1.663105 1.28071,3.25847 1.74814,4.968402 l 0.41404,3.496281 -0.41404,5.842474 0.13801,3.35827 0.46004,3.58829 c 0.25206,1.21961 0.12683,2.4102 -0.0115,3.59979 -0.51858,0.94602 -1.27132,1.51177 -1.97816,2.16218 0,0 -0.26167,0.26705 -0.95458,1.04658 l -0.73606,0.82807 c -0.45057,0.18168 -0.90858,0.33358 -1.44962,0.15338 l -0.29852,-0.3834 -1.15009,-2.11617 -1.97816,-1.38012 -0.78206,-1.2881 0.046,-3.08225 0.55204,-3.7723 0.59805,-2.20818 -0.50604,-2.30019 0.23002,-3.864309 1.05809,-3.726302 0.41403,-1.656133 -0.32203,-4.508365 0.32203,-3.58829 z" },
    { id: 12, label: "Lateral Sus", path: "m 115.23931,86.25697 c 0.24893,-1.623764 1.11225,-1.468468 1.51812,0.046 l 0.41404,5.888477 0.87407,4.232341 0.32202,3.036245 v 3.220267 l -0.092,2.99024 c 0.23002,1.47212 0.46003,3.42442 0.69005,4.41636 v 5.10641 c -0.0326,0.14048 -0.12185,0.28904 -0.36803,0.46003 h -4.94539 c -0.44324,-0.17782 -0.37503,-0.86708 -0.48305,-1.38011 0,0 0,-5.56645 0.27603,-7.08457 l 0.27602,-1.51812 0.046,-3.35827 0.13801,-3.266271 0.59805,-3.266262 z" },
    { id: 11, label: "Central Sus", path: "m 108.25831,85.61775 c 0.92868,-1.017119 1.36685,-0.603563 1.56142,0.520473 l -0.3253,4.554135 1.82166,6.050494 0.56975,2.537304 0.34102,7.286614 v 0 l 0.45542,8.26251 c -0.16828,0.35092 -0.26195,0.71428 -0.78071,1.00678 l -5.98544,0.0992 c -0.6459,-0.28642 -0.50386,-0.92303 -0.65059,-1.4313 l 0.52047,-9.43357 -0.45541,-6.70108 0.65059,-6.050494 c 0.53046,-2.364311 0.92397,-4.806882 2.27712,-6.701086 z" },
  
    ]    ;

const TEETH_LOWER: ToothPathDefinition[] = [
    { id: 48, label: "Molar 3 Jos", path: "m 179.92089,148.49735 c 1.72528,-1.3315 1.90883,-0.17253 2.60236,0.16265 1.24866,-1.14783 2.1827,-0.56529 3.09031,0.16265 -0.26821,-0.80463 2.44927,-1.50309 3.57825,-1.33372 l 0.65059,0.0976 1.39877,-0.74817 c 0.89084,-0.19492 1.15113,-0.0395 1.26865,0.19517 0,0 0.84577,0.97589 1.07347,2.3096 l 0.22771,1.33371 v 2.40719 c 0,0 0.29277,0.74818 -0.35782,2.01683 l -0.6506,1.26865 0.48795,1.75659 0.71565,3.41561 0.35782,4.22884 -0.16265,2.21201 -0.94335,3.02524 c -0.59147,0.89769 -2.16066,3.17813 -2.89513,-0.48794 l -0.35783,-2.34213 c -0.33718,-2.19023 -1.28406,-3.42237 -2.21201,-4.68425 0,0 -0.61806,0.94336 -0.68311,3.7409 l -0.0651,2.79754 0.13011,2.56983 c 0,0 -0.58552,0.65059 -0.91082,0.52047 -1.11424,-0.44569 -1.07348,-0.58553 -1.72407,-1.75659 l -0.65059,-1.17106 c 0,0 -0.0976,-0.19518 -0.8783,-2.47225 l -0.7807,-2.27707 c 0,0 -0.42289,-1.62648 -0.55301,-2.89513 -0.13012,-1.26865 -0.26023,-4.39148 -0.26023,-4.39148 l -0.0651,-1.36625 -1.56142,-3.15536 c -0.31454,-1.80271 -0.57617,-3.5922 0.1302,-5.13968 z" },
    { id: 47, label: "Molar 2 Jos", path: "m 164.30064,151.4526 c 0.27511,-0.74476 0.921,-1.40174 1.54276,-1.75651 0.88748,-0.5743 1.26393,0.0651 1.84015,0.23002 1.42268,-0.0216 2.57822,-0.61317 4.60037,0.64406 0.35864,-0.99214 1.14363,-1.49703 2.71422,-1.10409 l 2.66821,0.27602 c 0.9167,0.0169 1.46839,0.78205 1.51813,2.57621 l -0.092,5.88847 c -0.88068,0.88699 -1.24617,1.74778 -0.73606,2.89824 l 0.92007,4.46236 -0.23001,4.46236 c -0.27904,1.38011 -0.80146,2.76022 -1.28811,4.14033 l 0.46004,3.08225 c -0.10651,1.11787 -0.70397,0.88565 -1.2881,0.69006 -0.95014,-0.49132 -1.25291,-1.63 -1.61014,-2.71422 l -0.41403,-3.26626 c -0.24664,-3.1337 -0.49647,-5.93651 -0.82807,-0.27603 l -0.59804,4.32435 -0.46004,1.70214 c -0.94976,1.28409 -1.52374,0.47105 -2.11617,-0.13801 l -0.96608,-2.66822 -0.36803,-4.50836 c -0.12429,-3.20708 -0.42776,-3.24868 -0.92007,0.046 v 5.70446 l -0.41404,1.05809 c -0.52123,1.12207 -0.97412,1.21343 -1.84573,0.27371 -0.59454,-0.67138 -0.59842,-1.88423 -0.73047,-2.84992 l -0.92008,-8.18866 -0.18402,-3.54229 c 0.0613,-1.20689 0.28763,-2.26521 0.78207,-3.08225 -0.60418,-0.82194 -0.8813,-1.97093 -1.2421,-3.03624 l -0.18402,-2.89824 z" },
    { id: 46, label: "Molar 1 Jos", path: "m 149.51208,152.13429 c 0.5709,-1.65248 2.10619,-1.25565 3.63429,-0.87407 1.29581,1.09652 2.0103,0.83662 2.57621,0.23002 0.33812,-0.5636 0.77518,-0.63248 1.1961,-0.78206 1.7418,-0.86456 2.37914,-0.0724 3.31226,0.27602 0.42405,0.73599 1.2409,0.85473 2.27093,0.63847 1.13319,-0.0652 0.96594,0.81541 1.22536,1.38569 l 0.23002,4.14034 c -0.0495,1.21978 -0.24774,2.14207 -0.64405,2.66821 -0.71315,0.38007 -0.99559,0.82167 -1.1041,1.28811 l 0.55205,2.76022 0.78206,4.9224 -0.13801,5.33643 -0.46003,2.94424 c -0.37869,1.27028 -0.97705,1.9365 -1.70214,2.25418 -0.77104,0.64237 -1.22088,0.2676 -1.47212,-0.73606 l 0.32203,-2.71422 -0.27603,-1.38011 -1.2881,-1.51812 c -0.35767,-0.74732 -0.68797,-1.17976 -0.87407,0.046 l -0.36803,1.88615 0.23002,1.70214 0.23002,1.2421 c -0.102,1.50715 -0.4123,2.54561 -1.88616,0.96608 -0.84136,-0.67589 -0.97858,-1.75415 -1.2421,-2.76023 l -0.46003,-2.5302 c -0.2121,-1.23102 -0.46659,-3.20152 -0.41404,0.18401 l -0.092,2.02417 -0.18401,1.88615 -0.78206,1.2421 c -0.95758,1.01384 -1.45155,0.62469 -1.72678,-0.0674 -0.0308,-0.94531 0.064,-1.56047 0.11665,-2.46283 -0.48566,-0.98753 -0.92496,-2.17211 -1.28811,-3.6803 -0.15188,-1.00678 -0.41102,-1.59987 -0.36803,-3.35827 l 0.092,-3.54229 0.59805,-2.39219 0.73606,-2.30019 -1.01208,-1.84015 -0.69006,-2.4842 -0.046,-3.31226 z" },
    { id: 45, label: "Premolar 2 Jos", path: "m 138.10316,154.6645 c -0.0754,-1.23092 0.20509,-2.07367 1.47212,-1.84015 0.53962,0.3704 0.93077,0.0974 1.2881,-0.32203 l 0.41403,-0.64405 c 0.44448,-0.78378 1.06419,-1.14969 2.30019,-0.046 0.82707,0.27111 1.78642,0.17842 2.3922,1.05808 0.83319,-0.19559 1.70243,-0.58045 2.30018,0.46004 l 0.36803,3.31227 -0.27602,2.89823 -0.23002,1.2421 -0.41404,2.02416 -0.46003,1.47212 0.27602,1.88615 -0.13801,3.40428 -1.33411,4.76138 c -0.68619,0.86834 -1.17797,2.0179 -1.51812,3.05925 l -0.046,3.31227 -0.32202,1.65613 c -0.56165,0.34917 -1.10939,0.50356 -1.61013,0 -0.48469,-0.34448 -0.70992,-0.77544 -0.82807,-1.2421 l -0.36803,-2.5762 -0.18401,-2.62222 -0.96608,-3.63429 -0.82807,-2.39219 -0.23002,-2.80623 v -2.85223 l -1.10408,-4.9684 z" },
    { id: 44, label: "Premolar 1 Jos", path: "m 127.5158,155.16591 c 0.16507,-0.8733 0.56321,-1.54462 2.01683,-1.30118 0.61806,0.47952 1.23612,0.44154 1.85418,-0.29277 0.50186,-0.83067 1.55836,-0.89338 3.1879,-0.16265 0.35894,0.60649 0.83591,0.9061 1.62648,0.39036 0.92113,-0.0977 0.86483,0.0837 1.26865,0.42288 0.7569,0.27533 0.35223,3.3292 0.48794,4.8469 l -0.61806,2.01683 -0.3253,1.78913 -0.0325,3.44813 v 2.43971 c -0.26564,1.32939 -0.42926,2.7404 -1.106,3.7409 l -0.71565,2.04936 -0.42288,2.24454 0.0325,1.49636 0.6506,1.36624 0.94335,2.14695 0.0651,0.94336 c 0.007,0.63625 -0.0753,1.21148 -1.4313,0.91082 -0.81545,-0.33915 -1.53439,-0.7362 -1.91924,-1.33371 l -1.9843,-2.96019 -1.49636,-3.4156 -1.20359,-3.74089 -0.3253,-3.83849 0.16265,-4.03366 -0.3253,-2.60237 -0.58553,-2.37465 z" },
    { id: 43, label: "Canin Jos", path: "m 118.64359,155.81459 c 0.69852,-0.0513 1.20075,-0.69141 1.65613,-1.47212 l 0.96608,-1.47212 c 0.75155,-0.56465 1.47786,-1.58338 2.34619,-0.046 l 0.55204,1.2421 c 0.39996,0.72525 1.06597,0.78535 1.70214,0.92007 0.7752,0.15552 1.17113,0.6429 0.96608,1.65614 v 3.7263 l -0.27602,3.03624 c -0.3374,1.40569 -0.39627,2.71852 -0.36803,4.00233 l 0.32202,3.40427 -0.73606,5.38244 -1.05808,4.83039 -0.78207,3.17425 -0.092,3.77231 -0.27603,2.76022 c -0.82372,1.93093 -1.5522,1.4808 -2.25418,0.36803 l -1.33411,-5.24442 -0.50604,-3.08225 -0.59805,-8.32668 0.27603,-7.54461 0.18401,-1.61012 -0.73606,-2.07017 c -0.32927,-2.46887 -0.36017,-4.93773 0.046,-7.4066 z" },
    { id: 42, label: "Lateral Jos", path: "m 111.78903,156.87268 c 0.0572,-1.17984 1.4245,-1.10422 1.42612,-1.10409 l 3.03624,0.046 c 1.33573,-0.29298 1.0366,1.0489 1.2421,1.88615 l -0.64405,6.57853 -0.41403,2.11618 v 3.17425 l -0.41403,3.86431 -0.50605,2.99024 -0.13801,4.00233 -0.18401,2.57621 c -0.37815,0.59214 -0.61527,2.40649 -1.33411,0.046 l -0.32203,-4.18634 -0.69005,-5.29043 -0.41403,-4.32435 0.138,-3.26626 -0.41403,-3.26626 z" },
    { id: 41, label: "Central Jos", path: "m 104.88848,157.33271 c 0.20953,-1.99877 1.08958,-1.31545 1.74813,-1.51812 h 2.71423 c 1.48221,-0.10261 1.02363,1.02982 1.2881,1.70214 l -0.46004,6.1645 -0.55204,2.80622 0.18401,2.30019 -0.092,3.58829 -0.13802,3.17425 -0.78206,4.00233 -0.92007,3.81831 c -0.4038,0.43463 -0.76939,1.5189 -1.28811,0 l 0.18402,-4.69238 0.092,-2.71422 -0.50605,-2.80623 -0.69005,-2.57621 -0.092,-3.58829 -0.32203,-4.9684 z" },
  
];

export default function PatientPrintPage({ patientId }: PatientPrintPageProps) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [toothData, setToothData] = useState<Map<number, ToothData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

   // ÎN FISIERUL DE PRINT (PatientPrintPage)
// ÎN FISIERUL DE PRINT (PatientPrintPage)
const loadPatientData = async () => {
    setLoading(true);
    try {
      // Încarcă totul deodată, nu pe rând
      const [resPatient, resTooth] = await Promise.all([
        fetch(`/api/patients/${patientId}/summary`),
        fetch(`/api/patients/${patientId}/tooth-status`)
      ]);
  
      const dataPatient = await resPatient.json();
      const dataTooth = await resTooth.json();
  
      setPatientData(dataPatient.patient);
      const map = new Map();
      dataTooth.forEach((t: any) => map.set(t.toothNumber, t));
      setToothData(map);
      
      setLoading(false);
      
      // Notifică fereastra părinte IMEDIAT după încărcare
      requestAnimationFrame(() => {
        window.parent.postMessage("ready_to_print", "*");
      });
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Eroare la încărcarea datelor");
      setLoading(false);
    }
  };
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getToothColor = (toothNumber: number) => {
    const tooth = toothData.get(toothNumber);
    const status = tooth?.status || 'HEALTHY';
    return STATUS_CONFIG[status];
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg">Se încarcă datele pentru printare...</span>
        </div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error || 'Datele pacientului nu au fost găsite.'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Înapoi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden fixed bottom-8 right-8 z-50 flex gap-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Înapoi
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          Printează
        </button>
      </div>

      {/* Print Content */}
      <div className="max-w-[210mm] mx-auto p-8 print:p-0">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {patientData.firstName} {patientData.lastName}
              </h1>
              <p className="text-gray-600">
                {calculateAge(patientData.dateOfBirth)} ani • {
                  patientData.gender === "MALE" ? "Masculin" : 
                  patientData.gender === "FEMALE" ? "Feminin" : "Altul"
                }
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Data imprimării: {formatDate(new Date().toISOString())}</p>
              <p className="mt-1">ID Pacient: {patientData.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* Patient Information Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informații Personale</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Data Nașterii</p>
              <p className="text-gray-900">{formatDate(patientData.dateOfBirth)}</p>
            </div>
            {patientData.bloodType && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Grupă Sanguină</p>
                <p className="text-gray-900">{patientData.bloodType}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Telefon</p>
              <p className="text-gray-900">{patientData.phone}</p>
            </div>
            {patientData.email && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                <p className="text-gray-900">{patientData.email}</p>
              </div>
            )}
            {(patientData.address || patientData.city) && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Adresă</p>
                <p className="text-gray-900">
                  {patientData.address && `${patientData.address}, `}
                  {patientData.city && `${patientData.city}`}
                  {patientData.state && `, ${patientData.state}`}
                  {patientData.zipCode && ` ${patientData.zipCode}`}
                  {patientData.country && ` - ${patientData.country}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dental Chart */}
        <div className="mb-8 page-break-inside-avoid">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hartă Dentară</h2>
          <p className="text-sm text-gray-600 mb-3">
            Ultima actualizare: {toothData.size > 0 ? formatDate(
              Array.from(toothData.values())[0].lastUpdated || new Date().toISOString()
            ) : 'N/A'}
          </p>
          <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
            <svg viewBox="0 60 220 180" className="w-full h-auto">
              {/* Gums Layer */}
              <g id="gums-layer" style={{ pointerEvents: 'none' }}>
                <path 
                  d={GUM_PATH_UPPER} 
                  fill="#fbeff3" 
                  stroke="none" 
                  strokeWidth="0.5" 
                />
                <path 
                  d={GUM_PATH_LOWER} 
                  fill="#fbeff3" 
                  stroke="none" 
                  strokeWidth="0.5" 
                />
              </g>

              {/* Upper Right Quadrant */}
              <g id="upper-right">
                {TEETH_UPPER.map((tooth) => {
                  const colors = getToothColor(tooth.id);
                  return (
                    <path
                      key={tooth.id}
                      d={tooth.path}
                      fill={colors.fill}
                      stroke={colors.border}
                      strokeWidth="0.12"
                    />
                  );
                })}
              </g>

              {/* Upper Left Quadrant */}
              <g id="upper-left" transform="translate(209.5, 0) scale(-1, 1)">
                {TEETH_UPPER.map((tooth) => {
                  const leftId = tooth.id + 10;
                  const colors = getToothColor(leftId);
                  return (
                    <path
                      key={leftId}
                      d={tooth.path}
                      fill={colors.fill}
                      stroke={colors.border}
                      strokeWidth="0.12"
                    />
                  );
                })}
              </g>

              {/* Lower Right Quadrant */}
              <g id="lower-right">
                {TEETH_LOWER.map((tooth) => {
                  const colors = getToothColor(tooth.id);
                  return (
                    <path
                      key={tooth.id}
                      d={tooth.path}
                      fill={colors.fill}
                      stroke={colors.border}
                      strokeWidth="0.12"
                    />
                  );
                })}
              </g>

              {/* Lower Left Quadrant */}
              <g id="lower-left" transform="translate(209.5, 0) scale(-1, 1)">
                {TEETH_LOWER.map((tooth) => {
                  const leftId = tooth.id - 10;
                  const colors = getToothColor(leftId);
                  return (
                    <path
                      key={leftId}
                      d={tooth.path}
                      fill={colors.fill}
                      stroke={colors.border}
                      strokeWidth="0.12"
                    />
                  );
                })}
              </g>

              {/* Tooth Numbers */}
              <g id="labels" style={{ pointerEvents: 'none', userSelect: 'none' }} fontFamily="sans-serif">
                <style>
                  {`.tooth-label { font-size: 4px; font-weight: 600; fill: #64748b; }`}
                </style>

                {/* Upper Teeth Labels */}
                {TEETH_UPPER.map((tooth) => {
                  const xRight = TOOTH_CENTERS[tooth.id] || 0;
                  const xLeft = 216.5 - xRight - 5;

                  return (
                    <React.Fragment key={`label-upper-${tooth.id}`}>
                      <text x={xRight} y="130" textAnchor="middle" className="tooth-label">
                        {tooth.id}
                      </text>
                      <text x={xLeft} y="130" textAnchor="middle" className="tooth-label">
                        {tooth.id + 10}
                      </text>
                    </React.Fragment>
                  );
                })}

                {/* Lower Teeth Labels */}
                {TEETH_LOWER.map((tooth) => {
                  const xRight = TOOTH_CENTERS[tooth.id] || 0;
                  const xLeft = 216.5 - xRight - 5;

                  return (
                    <React.Fragment key={`label-lower-${tooth.id}`}>
                      <text x={xRight} y="145" textAnchor="middle" className="tooth-label">
                        {tooth.id}
                      </text>
                      <text x={xLeft} y="145" textAnchor="middle" className="tooth-label">
                        {tooth.id - 10}
                      </text>
                    </React.Fragment>
                  );
                })}
              </g>
            </svg>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <p className="text-xs font-semibold text-gray-700 mb-3">Legendă:</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border-2" 
                      style={{ 
                        backgroundColor: config.fill, 
                        borderColor: config.border 
                      }}
                    />
                    <span className="text-xs text-gray-700">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tooth Status Details */}
          {toothData.size > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Detalii Stare Dentară:</h3>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {Array.from(toothData.values())
                  .sort((a, b) => a.toothNumber - b.toothNumber)
                  .map((tooth) => (
                    <div key={tooth.toothNumber} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                      <span className="font-medium">#{tooth.toothNumber}</span>
                      <span className="text-gray-600">{STATUS_CONFIG[tooth.status].label}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Medical Information */}
        {(patientData.allergies?.length || patientData.medications?.length || patientData.medicalHistory) && (
          <div className="mb-8 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informații Medicale</h2>
            
            {patientData.allergies && patientData.allergies.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Alergii</p>
                <div className="flex flex-wrap gap-2">
                  {patientData.allergies.map((allergy, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patientData.medications && patientData.medications.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Medicamente</p>
                <div className="flex flex-wrap gap-2">
                  {patientData.medications.map((medication, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patientData.medicalHistory && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Istoric Medical</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-100 p-3 rounded">
                  {patientData.medicalHistory}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Insurance Information */}
        {patientData.insuranceProvider && (
          <div className="mb-8 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informații Asigurare</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Furnizor</p>
                <p className="text-gray-900">{patientData.insuranceProvider}</p>
              </div>
              {patientData.insurancePolicyNumber && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Număr Poliță</p>
                  <p className="text-gray-900">{patientData.insurancePolicyNumber}</p>
                </div>
              )}
              {patientData.insuranceGroupNumber && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Număr Grup</p>
                  <p className="text-gray-900">{patientData.insuranceGroupNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {patientData.emergencyContactName && (
          <div className="mb-8 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact de Urgență</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Nume</p>
                <p className="text-gray-900">{patientData.emergencyContactName}</p>
              </div>
              {patientData.emergencyContactPhone && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Telefon</p>
                  <p className="text-gray-900">{patientData.emergencyContactPhone}</p>
                </div>
              )}
              {patientData.emergencyContactRelation && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Relație</p>
                  <p className="text-gray-900">{patientData.emergencyContactRelation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {patientData.notes && (
          <div className="mb-8 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notițe Adiționale</h2>
            <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-100 p-4 rounded">
              {patientData.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-xs text-gray-500">
          <p>Document generat automat • Confidențial</p>
          <p className="mt-1">Clinica Dentară • Pentru uz medical exclusiv</p>
        </div>
      </div>

      {/* Print-specific CSS */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}