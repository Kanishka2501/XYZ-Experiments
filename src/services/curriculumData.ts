import { Concept, Problem } from '../types/tutor';

export const CANONICAL_CONCEPTS: Concept[] = [
  // -------------------------------------------------------------
  // PHYSICS -> Mechanics & Newton's Laws
  // -------------------------------------------------------------
  {
    id: 'phys_kinematics',
    subjectId: 'Physics',
    moduleId: 'mechanics',
    moduleTitle: 'Classical Mechanics',
    title: 'Kinematics & Vector Motion',
    description: 'Relating position, velocity, and constant acceleration in one and two dimensions.',
    order: 1,
    prerequisites: [],
    learningObjectives: [
      'Distinguish instantaneous velocity from average velocity',
      'Resolve motion into orthogonal vector components',
      'Select and apply constant-acceleration kinematic equations',
    ],
    canonicalFormulas: [
      { label: 'Velocity Definition', latex: '\\vec{v} = \\frac{d\\vec{r}}{dt}', explanation: 'Instantaneous rate of change of position' },
      { label: 'Position with Constant a', latex: 'x(t) = x_0 + v_0 t + \\frac{1}{2} a t^2', explanation: 'Kinematic equation in one dimension' },
      { label: 'Torricelli Relation', latex: 'v^2 = v_0^2 + 2a(x - x_0)', explanation: 'Kinematic relation independent of time' },
    ],
    commonMisconceptions: [
      'Confusing negative acceleration with slowing down (sign depends on chosen coordinate direction)',
      'Thinking acceleration must be zero at the peak of projectile motion when velocity is instantaneously zero',
      'Treating vectors like scalar quantities without resolving components',
    ],
    masteryScore: 82,
    status: 'strong',
  },
  {
    id: 'phys_newton_first',
    subjectId: 'Physics',
    moduleId: 'mechanics',
    moduleTitle: 'Classical Mechanics',
    title: "Newton's First Law: Inertia",
    description: 'The principle of inertia and the definition of inertial reference frames.',
    order: 2,
    prerequisites: ['phys_kinematics'],
    learningObjectives: [
      'Recognize that net force causes acceleration, not velocity',
      'Identify equilibrium states where sum of forces equals zero',
      'Understand the concept of an inertial frame of reference',
    ],
    canonicalFormulas: [
      { label: 'Equilibrium Condition', latex: '\\sum \\vec{F} = 0 \\iff \\vec{a} = 0 \\implies \\vec{v} = \\text{constant}', explanation: 'A body maintains uniform motion unless acted upon by a non-zero net external force' },
    ],
    commonMisconceptions: [
      'Believing a continuous force is necessary to sustain constant velocity (Aristotelian misconception)',
      'Thinking an object moving in a circle at constant speed has zero net force',
    ],
    masteryScore: 75,
    status: 'developing',
  },
  {
    id: 'phys_newton_second',
    subjectId: 'Physics',
    moduleId: 'mechanics',
    moduleTitle: 'Classical Mechanics',
    title: "Newton's Second Law: Force & Momentum",
    description: 'The quantitative link between net external force, inertial mass, and acceleration.',
    order: 3,
    prerequisites: ['phys_newton_first'],
    learningObjectives: [
      'Formulate vector equations along independent axes',
      'Distinguish mass (inertia) from weight (gravitational force)',
      'Relate net force to the time rate of change of linear momentum',
    ],
    canonicalFormulas: [
      { label: 'Fundamental Second Law', latex: '\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt} = m\\vec{a}', explanation: 'Net force equals mass times acceleration for constant mass' },
      { label: 'Component Equations', latex: '\\sum F_x = m a_x, \\quad \\sum F_y = m a_y', explanation: 'Vector decomposition into independent axes' },
    ],
    commonMisconceptions: [
      'Equating the normal force to mg automatically, even when accelerating vertically or with angled forces',
      'Treating ma as an applied physical force on the free-body diagram rather than the resultant acceleration',
      'Thinking heavier objects fall faster in vacuum',
    ],
    masteryScore: 68,
    status: 'learning',
  },
  {
    id: 'phys_newton_third',
    subjectId: 'Physics',
    moduleId: 'mechanics',
    moduleTitle: 'Classical Mechanics',
    title: "Newton's Third Law: Action & Reaction",
    description: 'Mutual interactions between interacting bodies and the nature of force pairs.',
    order: 4,
    prerequisites: ['phys_newton_second'],
    learningObjectives: [
      'Identify action-reaction force pairs across body boundaries',
      'Explain why action-reaction pairs never cancel each other out on a single object',
      'Apply interaction pairs in multi-body coupled systems',
    ],
    canonicalFormulas: [
      { label: 'Action-Reaction Pair', latex: '\\vec{F}_{A \\to B} = -\\vec{F}_{B \\to A}', explanation: 'Forces always occur in matched pairs acting on separate bodies' },
    ],
    commonMisconceptions: [
      'Believing action and reaction cancel out because they are equal and opposite (they act on different bodies!)',
      'Believing a heavy truck exerts a greater force on a small car during a collision than the car exerts on the truck',
      'Confusing normal force and gravity on an object as a Third Law pair',
    ],
    masteryScore: 48,
    status: 'learning',
  },
  {
    id: 'phys_friction_fbd',
    subjectId: 'Physics',
    moduleId: 'mechanics',
    moduleTitle: 'Classical Mechanics',
    title: 'Free-Body Diagrams & Friction',
    description: 'Systematic isolation of bodies, static vs kinetic friction, and inclined planes.',
    order: 5,
    prerequisites: ['phys_newton_third'],
    learningObjectives: [
      'Isolate an object and draw all contact and field forces with correct directions',
      'Calculate maximum static friction versus kinetic friction',
      'Resolve forces on inclined planes with tilted coordinate systems',
    ],
    canonicalFormulas: [
      { label: 'Static Friction Bound', latex: 'f_s \\le \\mu_s N', explanation: 'Static friction matches applied force until threshold' },
      { label: 'Kinetic Friction', latex: 'f_k = \\mu_k N', explanation: 'Kinetic friction opposes relative sliding motion' },
      { label: 'Inclined Plane Components', latex: 'W_\\parallel = mg \\sin\\theta, \\quad W_\\perp = mg \\cos\\theta', explanation: 'Decomposition of gravity along and perpendicular to plane' },
    ],
    commonMisconceptions: [
      'Assuming static friction is always equal to mu_s * N, rather than an inequality',
      'Assuming friction always opposes motion, rather than opposing relative sliding between surfaces',
    ],
    masteryScore: 42,
    status: 'learning',
  },
  {
    id: 'phys_work_energy',
    subjectId: 'Physics',
    moduleId: 'mechanics',
    moduleTitle: 'Classical Mechanics',
    title: 'Work, Kinetic Energy & Conservation',
    description: 'Work-energy theorem, conservative forces, and potential energy landscapes.',
    order: 6,
    prerequisites: ['phys_friction_fbd'],
    learningObjectives: [
      'Compute work done by variable and constant forces',
      'Apply the Work-Kinetic Energy Theorem: W_net = Delta K',
      'Construct conservation of mechanical energy equations with non-conservative losses',
    ],
    canonicalFormulas: [
      { label: 'Work Integral', latex: 'W = \\int_{r_1}^{r_2} \\vec{F} \\cdot d\\vec{r}', explanation: 'Line integral of force along trajectory' },
      { label: 'Work-Energy Theorem', latex: 'W_{\\text{net}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2', explanation: 'Net work equals change in kinetic energy' },
      { label: 'Conservation of Energy', latex: 'E = K + U = \\text{constant}', explanation: 'Mechanical energy conserved in absence of dissipative forces' },
    ],
    commonMisconceptions: [
      'Thinking normal forces always do zero work (false in moving elevators/inclines)',
      'Forgetting that work requires displacement in the direction of the force',
    ],
    masteryScore: 35,
    status: 'developing',
  },

  // -------------------------------------------------------------
  // MATHEMATICS -> Calculus
  // -------------------------------------------------------------
  {
    id: 'math_derivatives',
    subjectId: 'Mathematics',
    moduleId: 'calculus',
    moduleTitle: 'Differential Calculus',
    title: 'Derivatives as Instantaneous Rates',
    description: 'Geometric and physical meaning of the derivative as the limit of difference quotients.',
    order: 1,
    prerequisites: [],
    learningObjectives: [
      'Define derivative from the limit of the secant slope',
      'Interpret f’(x) as the slope of the tangent line',
      'Relate differentiability to continuity',
    ],
    canonicalFormulas: [
      { label: 'Derivative Definition', latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", explanation: 'Limit of average rate of change' },
    ],
    commonMisconceptions: [
      'Assuming continuity implies differentiability (e.g. sharp cusps like |x| at 0)',
      'Treating dy/dx as a simple algebraic fraction rather than a limit of differential forms',
    ],
    masteryScore: 78,
    status: 'strong',
  },
  {
    id: 'math_chain_rule',
    subjectId: 'Mathematics',
    moduleId: 'calculus',
    moduleTitle: 'Differential Calculus',
    title: 'The Chain Rule & Composition',
    description: 'Differentiating composite functions through instantaneous magnification ratios.',
    order: 2,
    prerequisites: ['math_derivatives'],
    learningObjectives: [
      'Decompose composite functions into inner and outer layers',
      'Apply the chain rule systematically: (f(g(x)))’ = f’(g(x)) * g’(x)',
      'Compute implicit derivatives of geometric equations',
    ],
    canonicalFormulas: [
      { label: 'Chain Rule', latex: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)", explanation: 'Product of rate of outer function with rate of inner' },
    ],
    commonMisconceptions: [
      'Forgetting to multiply by the derivative of the inner function',
      'Evaluating the outer derivative at x instead of at g(x)',
    ],
    masteryScore: 62,
    status: 'developing',
  },

  // -------------------------------------------------------------
  // CHEMISTRY -> Thermodynamics & Equilibrium
  // -------------------------------------------------------------
  {
    id: 'chem_equilibrium',
    subjectId: 'Chemistry',
    moduleId: 'equilibrium',
    moduleTitle: 'Chemical Dynamics',
    title: "Chemical Equilibrium & Le Chatelier",
    description: 'Dynamic equilibrium, reaction quotients, and system response to external perturbations.',
    order: 1,
    prerequisites: [],
    learningObjectives: [
      'Define dynamic equilibrium as equal forward and reverse rates',
      'Write equilibrium expressions K_eq and compare with Q',
      'Predict shifts using Le Chatelier’s principle for temperature, pressure, and concentration changes',
    ],
    canonicalFormulas: [
      { label: 'Equilibrium Constant', latex: 'K = \\frac{[C]^c [D]^d}{[A]^a [B]^b}', explanation: 'Ratio of products to reactants at equilibrium' },
      { label: 'Gibbs Free Energy', latex: '\\Delta G^\\circ = -RT \\ln K', explanation: 'Connection between thermodynamic spontaneity and equilibrium' },
    ],
    commonMisconceptions: [
      'Believing reaction stops when equilibrium is reached (it is dynamic)',
      'Believing concentrations of reactants and products must become equal',
    ],
    masteryScore: 52,
    status: 'learning',
  },

  // -------------------------------------------------------------
  // COMPUTER SCIENCE -> Algorithms & Complexity
  // -------------------------------------------------------------
  {
    id: 'cs_big_o',
    subjectId: 'Computer Science',
    moduleId: 'algorithms',
    moduleTitle: 'Algorithms & Complexity',
    title: 'Asymptotic Analysis & Big-O',
    description: 'Formal classification of runtime and space growth rates as inputs scale to infinity.',
    order: 1,
    prerequisites: [],
    learningObjectives: [
      'Define Big-O, Big-Omega, and Big-Theta formally',
      'Analyze tight upper bounds for iterative and recursive procedures',
      'Identify dominant terms and drop constants',
    ],
    canonicalFormulas: [
      { label: 'Formal Big-O', latex: 'f(n) = O(g(n)) \\iff \\exists c > 0, n_0 > 0: f(n) \\le c \\cdot g(n) \\; \\forall n \\ge n_0', explanation: 'Asymptotic upper bound definition' },
    ],
    commonMisconceptions: [
      'Confusing worst-case time with Big-O notation (Big-O is a bound, worst-case is an operational scenario)',
      'Assuming O(n log n) is always faster than O(n^2) for small values of n',
    ],
    masteryScore: 84,
    status: 'strong',
  },
];

export const CANONICAL_PROBLEMS: Problem[] = [
  {
    id: 'prob_third_law_horse_cart',
    conceptId: 'phys_newton_third',
    conceptTitle: "Newton's Third Law: Action & Reaction",
    subjectTitle: 'Physics',
    title: 'The Horse and Cart Paradox',
    difficulty: 'standard',
    question: `A horse is hitched to a wagon. The horse says: "Newton's Third Law states that every action has an equal and opposite reaction. If I exert a forward force $F_{\\text{horse on cart}}$ on the wagon, the wagon exerts an equal backward force $F_{\\text{cart on horse}}$ on me. Since these two forces are equal in magnitude and opposite in direction, the net force must be zero, making it impossible for us to accelerate."
    
Identify the precise conceptual flaw in the horse's argument. What force actually accelerates the cart forward, and what force accelerates the horse forward?`,
    given: [
      'Force on cart by horse: \\vec{F}_{H \\to C}',
      'Force on horse by cart: \\vec{F}_{C \\to H} = -\\vec{F}_{H \\to C}',
      'Ground interaction with horse hooves',
      'Ground interaction with cart wheels',
    ],
    toFind: 'The flaw in the horse’s cancellation reasoning, and the external net force on each system.',
    canonicalPrinciple: '\\sum \\vec{F}_{\\text{system}} = m \\vec{a}. \\text{ Action-reaction forces act on separate bodies and therefore NEVER cancel on a single isolated free-body diagram.}',
    hints: [
      'Level 0: Look at whose free-body diagram the horse is analyzing. Can forces cancel if they act on two different physical objects?',
      'Level 1: Draw two separate systems: (1) The Cart alone, and (2) The Horse alone. What forces act on the Cart alone?',
      'Level 2: The only horizontal forces on the cart are the forward pull of the horse and friction/rolling resistance from the ground.',
      'Level 3: The horse moves forward because the horse pushes backwards on the ground with its hooves, and by Newton\'s 3rd Law, the GROUND pushes forward on the horse.',
      'Level 4: If F_ground_on_horse > F_cart_on_horse, the horse accelerates forward! The two Third-Law pairs act on different bodies and do not sum to zero on either one.',
    ],
    solution: `Flaw: Action-reaction pairs act on different objects and never cancel on a single body.
1. Cart accelerates if: F(horse on cart) > f(ground on cart).
2. Horse accelerates if: F(ground on horse hooves) > F(cart on horse).
The forward external force driving the whole system is the static friction exerted forward by the Earth on the horse's hooves.`,
    commonMisconceptions: [
      'Action-reaction forces cancel because they act on the same object',
      'The horse must exert more force on the cart than the cart exerts on the horse to move',
    ],
  },
  {
    id: 'prob_second_law_elevator',
    conceptId: 'phys_newton_second',
    conceptTitle: "Newton's Second Law: Force & Momentum",
    subjectTitle: 'Physics',
    title: 'Apparent Weight in an Accelerating Elevator',
    difficulty: 'standard',
    question: `A student of mass $m = 65\\text{ kg}$ stands on a calibrated scale inside an elevator. 
As the elevator approaches its destination, it is traveling upward with an initial velocity of $4.0\\text{ m/s}$, but it is decelerating to a stop at a constant rate of $a = 1.8\\text{ m/s}^2$ downward.

Using $g = 9.80\\text{ m/s}^2$:
1. What value does the scale read in Newtons?
2. Does the student feel lighter or heavier, and what physical quantity does the scale actually measure?`,
    given: [
      'Mass m = 65\\text{ kg}',
      'Upward velocity v = +4.0\\text{ m/s}',
      'Downward acceleration a_y = -1.80\\text{ m/s}^2',
      'g = 9.80\\text{ m/s}^2',
    ],
    toFind: 'Scale reading N (Normal force) and physical sensation interpretation.',
    canonicalPrinciple: '\\sum F_y = N - mg = m a_y \\implies N = m(g + a_y)',
    hints: [
      'Level 0: What two physical forces act on the student? What does a bathroom scale actually measure: gravity or normal force?',
      'Level 1: The scale measures the normal contact force N exerted upward by the scale plate on the student\'s feet.',
      'Level 2: Establish an upward positive y-axis. The acceleration is downward, so a_y = -1.80 m/s^2. Write Newton\'s 2nd Law.',
      'Level 3: N - mg = m(-1.80) \\implies N = m(9.80 - 1.80) = m(8.00).',
      'Level 4: Compute N = 65 \\times 8.00 = 520 N. Since 520 N < mg (637 N), the student feels lighter.',
    ],
    solution: `1. The scale reads N = 520 N.
2. The student feels lighter because apparent weight is the normal force N. Because acceleration is directed downward (a_y = -1.80 m/s^2), N = m(g - |a|) = 65(8.00) = 520 N, which is 117 N less than the true weight of 637 N.`,
    commonMisconceptions: [
      'Believing scale reading is always equal to true gravitational force mg',
      'Confusing the direction of motion (upward) with the direction of acceleration (downward)',
    ],
  },
  {
    id: 'prob_friction_box_ramp',
    conceptId: 'phys_friction_fbd',
    conceptTitle: 'Free-Body Diagrams & Friction',
    subjectTitle: 'Physics',
    title: 'The Critical Angle of Repose',
    difficulty: 'challenging',
    question: `A wooden block of mass $m$ rests on an adjustable inclined ramp with static friction coefficient $\\mu_s = 0.577$. The angle of inclination $\\theta$ is slowly increased from zero.

1. Show from first principles that the critical angle $\\theta_c$ at which the block just begins to slip is independent of the block's mass $m$ and local gravity $g$.
2. Compute $\\theta_c$ in degrees for $\\mu_s = 0.577$.`,
    given: [
      'Mass m',
      'Static friction coefficient \\mu_s = 0.577',
      'Ramp angle \\theta',
      'Local gravity g',
    ],
    toFind: 'Derivation of critical angle \\theta_c and numerical value in degrees.',
    canonicalPrinciple: '\\text{At threshold: } f_s^{\\max} = \\mu_s N. \\quad \\sum F_\\perp = N - mg\\cos\\theta = 0, \\quad \\sum F_\\parallel = mg\\sin\\theta - f_s^{\\max} = 0.',
    hints: [
      'Level 0: Draw a free body diagram with axes parallel and perpendicular to the inclined ramp.',
      'Level 1: Balance forces perpendicular to the ramp to find normal force N in terms of m, g, and \\theta.',
      'Level 2: At the verge of slipping, static friction reaches its maximum: f_s = \\mu_s N.',
      'Level 3: Equate mg \\sin\\theta to \\mu_s mg \\cos\\theta. What happens to m and g on both sides?',
      'Level 4: Notice that \\tan\\theta_c = \\mu_s. Calculate \\arctan(0.577).',
    ],
    solution: `1. Perpendicular balance: N = mg \\cos\\theta.
Parallel balance at threshold: mg \\sin\\theta_c = f_s^{\\max} = \\mu_s N = \\mu_s mg \\cos\\theta_c.
Dividing both sides by mg \\cos\\theta_c: \\tan\\theta_c = \\mu_s.
Both m and g cancel completely, proving independence.
2. For \\mu_s = 0.577 \\approx 1/\\sqrt{3}:
\\theta_c = \\arctan(0.577) = 30.0^\\circ.`,
    commonMisconceptions: [
      'Thinking a heavier block slips at a lower angle than a light block',
      'Using sin for the normal force component instead of cos',
    ],
  },
  {
    id: 'prob_calculus_chain_rule_rate',
    conceptId: 'math_chain_rule',
    conceptTitle: 'The Chain Rule & Composition',
    subjectTitle: 'Mathematics',
    title: 'Expanding Spherical Ripple',
    difficulty: 'standard',
    question: `A spherical weather balloon is being inflated such that its radius $r$ is expanding at a constant rate of $\\frac{dr}{dt} = 0.50\\text{ cm/s}$.

Using the volume of a sphere $V = \\frac{4}{3}\\pi r^3$:
1. Express $\\frac{dV}{dt}$ in terms of $r$ and $\\frac{dr}{dt}$ using the Chain Rule.
2. Find the instantaneous rate of change of volume when the radius is exactly $r = 10\\text{ cm}$.`,
    given: [
      'V(r) = \\frac{4}{3}\\pi r^3',
      '\\frac{dr}{dt} = 0.50\\text{ cm/s}',
      'Target radius r = 10\\text{ cm}',
    ],
    toFind: 'Instantaneous rate of volume change \\frac{dV}{dt} in \\text{cm}^3/\\text{s}.',
    canonicalPrinciple: '\\frac{dV}{dt} = \\frac{dV}{dr} \\cdot \\frac{dr}{dt}',
    hints: [
      'Level 0: Volume is a function of radius, and radius is a function of time. What does the Chain Rule tell us about \\frac{dV}{dt}?',
      'Level 1: Differentiate V(r) with respect to r first: \\frac{dV}{dr} = 4\\pi r^2 (the surface area!).',
      'Level 2: Multiply \\frac{dV}{dr} by \\frac{dr}{dt}.',
      'Level 3: Substitute r = 10 and \\frac{dr}{dt} = 0.50: \\frac{dV}{dt} = 4\\pi (10)^2 \\times 0.50.',
      'Level 4: 4\\pi (100) \\times 0.50 = 200\\pi \\approx 628.32 \\text{ cm}^3/\\text{s}.',
    ],
    solution: `1. By the Chain Rule: \\frac{dV}{dt} = \\frac{dV}{dr} \\cdot \\frac{dr}{dt} = 4\\pi r^2 \\frac{dr}{dt}.
2. At r = 10 cm:
\\frac{dV}{dt} = 4\\pi (100)(0.50) = 200\\pi \\text{ cm}^3/\\text{s} \\approx 628.3 \\text{ cm}^3/\\text{s}.`,
    commonMisconceptions: [
      'Differentiating r^3 as 3r^2 without multiplying by dr/dt',
      'Plugging in r = 10 before taking the derivative',
    ],
  },
  {
    id: 'prob_chem_le_chatelier_habers',
    conceptId: 'chem_equilibrium',
    conceptTitle: 'Chemical Equilibrium & Le Chatelier',
    subjectTitle: 'Chemistry',
    title: "Haber-Bosch Equilibrium Perturbation",
    difficulty: 'standard',
    question: `Consider the synthesis of ammonia:
$$\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) \\quad \\Delta H^\\circ = -92.4\\text{ kJ/mol}$$

The reaction has reached dynamic equilibrium in a rigid closed vessel.
Predict and explain using Le Chatelier's Principle:
1. The direction of the shift if the vessel volume is reduced by half at constant temperature.
2. The direction of the shift if the temperature is increased.
3. Does the numerical value of the equilibrium constant $K_{\\text{eq}}$ increase, decrease, or remain unchanged for each of the two perturbations?`,
    given: [
      '1 mol N_2(g) + 3 mol H_2(g) -> 4 moles gas reactants',
      '2 mol NH_3(g) -> 2 moles gas products',
      'Exothermic reaction: \\Delta H^\\circ = -92.4\\text{ kJ/mol}',
    ],
    toFind: 'Shift directions and whether K_eq changes in each case.',
    canonicalPrinciple: 'Le Chatelier: system shifts to counter perturbation. K_eq depends ONLY on temperature.',
    hints: [
      'Level 0: Count total moles of gas on reactant side vs product side.',
      'Level 1: Halving volume increases overall pressure. To reduce pressure, does the system favor fewer or more moles of gas?',
      'Level 2: 4 moles gas on left vs 2 moles gas on right. Shifting right lowers total moles.',
      'Level 3: Heat is a product (exothermic). Adding temperature adds "heat" to products.',
      'Level 4: Pressure change does NOT alter K_eq. Temperature change DOES alter K_eq because \\Delta G^\\circ = -RT \\ln K.',
    ],
    solution: `1. Volume reduction (pressure increase): Shifts RIGHT toward fewer gas moles (4 moles -> 2 moles). K_eq remains unchanged.
2. Temperature increase: Shifts LEFT (endothermic direction to absorb added heat). K_eq decreases because products are consumed.`,
    commonMisconceptions: [
      'Thinking K_eq changes when pressure or concentration changes (K_eq only changes with temperature)',
      'Believing adding heat favors the exothermic direction',
    ],
  },
];

// Diagnostic questions for the "Let's find out how you think" onboarding
export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'diag_1',
    subject: 'Physics',
    concept: "Newton's First Law",
    question: 'A spacecraft in deep interstellar space turns off all engines. There are no nearby stars or gravitational fields. What will happen to the spacecraft’s velocity?',
    options: [
      { id: 'a', text: 'It will slowly decelerate to a complete stop as momentum drains away.', score: 0, feedback: 'Aristotelian misconception: force is needed to sustain motion.' },
      { id: 'b', text: 'It will continue moving at the exact same speed and direction indefinitely.', score: 10, feedback: 'Correct first-principles grasp of inertia.' },
      { id: 'c', text: 'It will start to veer into a natural curved trajectory.', score: 0, feedback: 'Curvature requires an external transverse force.' },
      { id: 'd', text: 'Its velocity depends on how much fuel remains in the tanks.', score: 0, feedback: 'Mass doesn’t create spontaneous deceleration in vacuum.' },
    ],
  },
  {
    id: 'diag_2',
    subject: 'Physics',
    concept: "Newton's Third Law",
    question: 'A heavy freight truck crashes head-on into a small compact car. During the collision, how does the magnitude of the force exerted by the truck on the car compare to the force exerted by the car on the truck?',
    options: [
      { id: 'a', text: 'The truck exerts a significantly greater force because it has far more mass and momentum.', score: 0, feedback: 'Very common misconception confusing acceleration damage (a = F/m) with the interaction force itself.' },
      { id: 'b', text: 'The forces are precisely equal in magnitude.', score: 10, feedback: 'Superb! Newton’s 3rd Law guarantees F_truck = -F_car regardless of mass difference.' },
      { id: 'c', text: 'The car exerts a greater force because it stops more abruptly.', score: 0, feedback: 'Confuses deceleration magnitude with force pair.' },
      { id: 'd', text: 'It depends on which vehicle was traveling faster before impact.', score: 0, feedback: 'Velocity does not alter the symmetry of contact force pairs.' },
    ],
  },
  {
    id: 'diag_3',
    subject: 'Physics',
    concept: "Newton's Second Law & Friction",
    question: 'A box rests on a horizontal floor. You push horizontally with a gentle force of 10 N, but the box does not budge. The maximum static friction force is calculated as 25 N. What is the magnitude of the static friction force currently acting on the box?',
    options: [
      { id: 'a', text: 'Exactly 10 N in the opposite direction.', score: 10, feedback: 'Masterful! Static friction is an inequality (f_s <= mu_s N) that adjusts exactly to match the applied push until the threshold is crossed.' },
      { id: 'b', text: '25 N in the opposite direction.', score: 0, feedback: 'If static friction were 25 N while you push with 10 N, the box would accelerate backwards towards you!' },
      { id: 'c', text: '0 N because the box is not moving.', score: 0, feedback: 'Without static friction, a 10 N push would accelerate the box immediately.' },
      { id: 'd', text: '15 N (the difference between threshold and push).', score: 0, feedback: 'Friction does not store residual differences.' },
    ],
  },
];
