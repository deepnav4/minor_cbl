// Mock data for the phase-1 frontend. Replaced by the api + Postgres in phase 2.
import { buildReport, idealTimeSec, scoreResponse } from "./cbl";
import type { Question, Report, Subject } from "./types";

const q = (
  id: string,
  topicId: string,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  difficulty?: 1 | 2 | 3,
): Question => ({ id, topicId, prompt, options, answer, explanation, difficulty });

const os: Subject = {
  id: "os",
  name: "Operating Systems",
  source: { type: "pdf", filename: "operating-systems-notes.pdf" },
  createdAt: "2026-11-01T10:00:00.000Z",
  status: "ready",
  topics: [
    { id: "os-proc", name: "Processes & Threads" },
    { id: "os-sched", name: "CPU Scheduling" },
    { id: "os-sync", name: "Synchronization" },
    { id: "os-dead", name: "Deadlocks" },
    { id: "os-mem", name: "Memory Management" },
    { id: "os-vm", name: "Virtual Memory" },
    { id: "os-fs", name: "File Systems" },
  ],
  pages: [
    {
      id: "os-p1",
      topicId: "os-proc",
      title: "Processes and the PCB",
      markdown: `## Processes and the PCB

A **process** is a program in execution. Along with the program code it has a program counter, registers, a stack, a heap and a data section.

The OS tracks each process with a **Process Control Block (PCB)**:

| Field | Purpose |
|---|---|
| Process state | new, ready, running, waiting, terminated |
| Program counter | address of the next instruction |
| CPU registers | saved on a context switch |
| Scheduling info | priority, queue pointers |
| Memory info | page / segment tables |

A **context switch** saves the PCB of the running process and loads another's. It is pure overhead, because no useful work happens during the switch.`,
    },
    {
      id: "os-p2",
      topicId: "os-proc",
      title: "Threads",
      markdown: `## Threads

A **thread** is the basic unit of CPU utilisation: a thread ID, program counter, register set and stack.
Threads of one process **share** its code, data and open files.

**Why threads?** Responsiveness, resource sharing, cheaper creation than processes, and multicore scalability.

**Models**
- *Many-to-one*: many user threads map to one kernel thread. One blocking call blocks all of them.
- *One-to-one*: each user thread gets a kernel thread (Linux, Windows).
- *Many-to-many*: user threads are multiplexed onto a smaller or equal number of kernel threads.`,
    },
    {
      id: "os-p3",
      topicId: "os-sched",
      title: "Scheduling algorithms",
      markdown: `## CPU scheduling algorithms

Criteria: CPU utilisation, throughput, **turnaround time**, **waiting time**, response time.

- **FCFS**: simple, but suffers from the *convoy effect*.
- **SJF**: optimal average waiting time. Needs the next burst length, which is predicted with exponential averaging.
- **SRTF**: preemptive SJF.
- **Priority**: risk of *starvation*, solved with *aging*.
- **Round Robin**: time quantum *q*. A very large *q* behaves like FCFS, a very small *q* gives too much context-switch overhead.
- **Multilevel feedback queue**: processes move between queues based on behaviour.`,
    },
    {
      id: "os-p4",
      topicId: "os-sync",
      title: "Critical sections and semaphores",
      markdown: `## The critical-section problem

A solution must satisfy:
1. **Mutual exclusion**: only one process in the critical section at a time.
2. **Progress**: if no one is inside, the choice of who enters next can't be postponed forever.
3. **Bounded waiting**: there is a limit on how many times others can enter before a waiting process does.

**Peterson's solution** works for two processes using \`flag[]\` and \`turn\`.

A **semaphore** \`S\` is an integer accessed only through atomic \`wait()\` (P) and \`signal()\` (V).
- *Binary semaphore*: acts like a mutex lock.
- *Counting semaphore*: controls access to a pool of N resources.

Classic problems: bounded buffer, readers–writers, dining philosophers.`,
    },
    {
      id: "os-p5",
      topicId: "os-dead",
      title: "Deadlock conditions and handling",
      markdown: `## Deadlocks

Deadlock can arise only if **all four** conditions hold at the same time (Coffman):
1. Mutual exclusion
2. Hold and wait
3. No preemption
4. Circular wait

**Handling**
- *Prevention*: break one of the four conditions, e.g. impose a total ordering on resources.
- *Avoidance*: **Banker's algorithm** only grants a request if the system stays in a *safe state*.
- *Detection and recovery*: build a wait-for graph and look for cycles, then abort processes or preempt resources.
- *Ignore it*: the "ostrich algorithm" that most general-purpose OSes use.`,
    },
    {
      id: "os-p6",
      topicId: "os-mem",
      title: "Paging and segmentation",
      markdown: `## Memory management

**Contiguous allocation** suffers from *external fragmentation*, which compaction can fix.

**Paging** divides logical memory into fixed-size *pages* and physical memory into *frames* of the same size.
- Logical address = (page number *p*, offset *d*).
- A page table maps *p* to a frame. The **TLB** caches recent translations.
- Paging removes external fragmentation, but there can still be *internal* fragmentation in the last page.

**Effective access time** with a TLB hit ratio α:
EAT = α·(TLB + mem) + (1 − α)·(TLB + 2·mem)

**Segmentation** follows the programmer's view (code, stack, heap) using variable-size segments.`,
    },
    {
      id: "os-p7",
      topicId: "os-vm",
      title: "Demand paging and replacement",
      markdown: `## Virtual memory

**Demand paging** loads a page only when it is first referenced. A missing page causes a **page fault**.

**Page replacement algorithms**
- **FIFO**: can show *Belady's anomaly* (more frames → more faults).
- **Optimal (OPT)**: replace the page not used for the longest time in the future. Lowest fault rate, but not implementable. Used as a benchmark.
- **LRU**: a good approximation of OPT. A *stack algorithm*, so it has no Belady's anomaly.

**Thrashing**: the process spends more time paging than executing. The working-set model and page-fault-frequency control prevent it.`,
    },
    {
      id: "os-p8",
      topicId: "os-fs",
      title: "File allocation methods",
      markdown: `## File systems

**Allocation methods**
- *Contiguous*: fast sequential and direct access, but external fragmentation.
- *Linked*: no external fragmentation, but direct access is slow (FAT is a variant).
- *Indexed*: an index block holds pointers (as in UNIX inodes with direct, single, double and triple indirect pointers).

**Free-space management**: bit vector, linked list, grouping, counting.

**Directory structures**: single-level, two-level, tree, acyclic graph.`,
    },
  ],
  questions: [
    q("os-q1", "os-proc", "Which of these is NOT stored in a Process Control Block?", ["Program counter", "CPU registers", "Source code of the program", "Process state"], 2, "The PCB stores execution context (state, PC, registers, scheduling and memory info), not the program source."),
    q("os-q2", "os-proc", "Threads belonging to the same process share:", ["Stack", "Register set", "Program counter", "Code and data sections"], 3, "Each thread has its own stack, registers and PC, but shares the process's code, data and open files."),
    q("os-q3", "os-proc", "In the many-to-one threading model, what happens when one thread makes a blocking system call?", ["Only that thread blocks", "The entire process blocks", "The kernel creates a new kernel thread", "The thread is migrated to another core"], 1, "All user threads map to one kernel thread, so one blocking call blocks the whole process."),
    q("os-q4", "os-sched", "Which scheduling algorithm gives the minimum average waiting time for a given set of processes?", ["FCFS", "Round Robin", "SJF", "Priority"], 2, "SJF is provably optimal for average waiting time (non-preemptive, all processes available at t = 0).", 3),
    q("os-q5", "os-sched", "Round Robin with a very large time quantum behaves like:", ["SJF", "FCFS", "Priority scheduling", "Multilevel queue"], 1, "If the quantum is longer than every burst, each process runs to completion in arrival order, which is FCFS."),
    q("os-q6", "os-sched", "Aging is a technique used to solve:", ["Convoy effect", "Starvation", "Thrashing", "Belady's anomaly"], 1, "Aging gradually raises the priority of waiting processes so low-priority processes are not starved."),
    q("os-q7", "os-sync", "Which requirement of a critical-section solution guarantees that a waiting process will eventually enter?", ["Mutual exclusion", "Progress", "Bounded waiting", "Atomicity"], 2, "Bounded waiting limits how many times others may enter first, so no process waits forever."),
    q("os-q8", "os-sync", "A counting semaphore initialised to 5 is best used to:", ["Protect a single critical section", "Control access to a pool of 5 identical resources", "Implement busy waiting", "Prevent deadlock"], 1, "The count tracks how many of the N identical resources are still available."),
    q("os-q9", "os-sync", "Peterson's solution is designed for:", ["Any number of processes", "Exactly two processes", "Only kernel threads", "Multiprocessor systems without shared memory"], 1, "Peterson's algorithm is a classic software solution for two processes using flag[] and turn."),
    q("os-q10", "os-dead", "Which is NOT one of the four necessary conditions for deadlock?", ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], 2, "The condition is NO preemption. Allowing preemption breaks deadlock.", 1),
    q("os-q11", "os-dead", "The Banker's algorithm is an example of deadlock:", ["Prevention", "Avoidance", "Detection", "Recovery"], 1, "It avoids deadlock by granting a request only if the system remains in a safe state."),
    q("os-q12", "os-dead", "Imposing a total ordering on resource types and requesting them in increasing order prevents deadlock by breaking:", ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"], 3, "With a global ordering, no cycle can form in the resource-allocation graph.", 3),
    q("os-q13", "os-mem", "Paging eliminates:", ["Internal fragmentation", "External fragmentation", "Both kinds of fragmentation", "Page faults"], 1, "Any free frame can hold any page, so there is no external fragmentation. Internal fragmentation can remain in the last page."),
    q("os-q14", "os-mem", "The TLB is used to:", ["Store the entire page table", "Cache recent page-number-to-frame translations", "Hold swapped-out pages", "Track free frames"], 1, "The TLB is a small, fast associative cache of recent translations."),
    q("os-q15", "os-mem", "With a TLB lookup of 20 ns, memory access of 100 ns and a 80% hit ratio, the effective access time is:", ["120 ns", "140 ns", "100 ns", "220 ns"], 1, "EAT = 0.8 × 120 + 0.2 × 220 = 96 + 44 = 140 ns.", 3),
    q("os-q16", "os-vm", "Belady's anomaly can occur with which page replacement algorithm?", ["LRU", "Optimal", "FIFO", "All of them"], 2, "FIFO is not a stack algorithm, so adding frames can increase faults. LRU and OPT are immune."),
    q("os-q17", "os-vm", "Thrashing occurs when:", ["The CPU is idle because of I/O", "A process spends more time paging than executing", "The TLB hit ratio is 100%", "Too few processes are in memory"], 1, "When a process's working set doesn't fit in its frames, it faults continuously."),
    q("os-q18", "os-vm", "The Optimal page replacement algorithm is mainly used:", ["In Linux by default", "As a benchmark for other algorithms", "For small memories only", "When the TLB misses"], 1, "It needs future knowledge, so it is used as a lower bound to compare real algorithms against."),
    q("os-q19", "os-fs", "Which allocation method suffers from external fragmentation?", ["Linked", "Indexed", "Contiguous", "None"], 2, "Contiguous allocation needs runs of free blocks, which leads to external fragmentation."),
    q("os-q20", "os-fs", "UNIX inodes are an example of:", ["Contiguous allocation", "Linked allocation", "Indexed allocation", "Hashed allocation"], 2, "Inodes hold direct and indirect block pointers, which is indexed allocation.", 1),
    q("os-q21", "os-fs", "Direct (random) access is slowest with:", ["Contiguous allocation", "Linked allocation", "Indexed allocation", "All are equal"], 1, "Linked allocation must follow pointers from the start of the file to reach block i."),
  ],
};

const dbms: Subject = {
  id: "dbms",
  name: "Database Management Systems",
  source: { type: "syllabus-image", filename: "dbms-syllabus.jpg" },
  createdAt: "2026-11-18T09:30:00.000Z",
  status: "ready",
  topics: [
    { id: "db-er", name: "ER Model" },
    { id: "db-ra", name: "Relational Algebra" },
    { id: "db-sql", name: "SQL" },
    { id: "db-norm", name: "Normalization" },
    { id: "db-txn", name: "Transactions & Concurrency" },
    { id: "db-idx", name: "Indexing" },
  ],
  pages: [
    { id: "db-p1", topicId: "db-er", title: "Entity–Relationship model", markdown: `## Entity–Relationship model\n\n- **Entity**: a real-world object (Student). An **entity set** is a collection of similar entities.\n- **Attributes**: simple or composite, single- or multi-valued, and *derived* (e.g. age from date of birth).\n- **Relationship sets** have a *cardinality*: 1:1, 1:N or M:N.\n- **Participation**: total (double line) or partial.\n- A **weak entity** has no key of its own. It is identified through an *identifying relationship* with its owner plus a *partial key* (discriminator).` },
    { id: "db-p2", topicId: "db-ra", title: "Relational algebra operators", markdown: `## Relational algebra\n\n| Operator | Symbol | Meaning |\n|---|---|---|\n| Select | σ | filter rows |\n| Project | π | choose columns (removes duplicates) |\n| Union / Difference | ∪ / − | union-compatible relations |\n| Cartesian product | × | all pairs |\n| Rename | ρ | rename relation or attributes |\n| Join | ⋈ | σ over × |\n| Division | ÷ | "for all" queries |\n\nSelect, project, union, difference, product and rename are the **fundamental** operators. Join and division can be derived from them.` },
    { id: "db-p3", topicId: "db-sql", title: "SQL essentials", markdown: `## SQL essentials\n\n\`\`\`sql\nSELECT dept, COUNT(*) AS n\nFROM employee\nWHERE salary > 50000\nGROUP BY dept\nHAVING COUNT(*) > 3\nORDER BY n DESC;\n\`\`\`\n\n- \`WHERE\` filters **rows** before grouping. \`HAVING\` filters **groups** after.\n- \`NULL\` comparisons give *unknown*, so use \`IS NULL\`.\n- \`LEFT JOIN\` keeps every row from the left table.\n- \`DELETE\` removes rows (can be rolled back). \`DROP\` removes the table itself.` },
    { id: "db-p4", topicId: "db-norm", title: "Functional dependencies & normal forms", markdown: `## Normalization\n\nA **functional dependency** X → Y means equal X values imply equal Y values.\n\n- **1NF**: atomic values only.\n- **2NF**: 1NF, and no non-prime attribute depends on *part* of a candidate key.\n- **3NF**: for every FD X → A, either X is a superkey or A is prime.\n- **BCNF**: for every non-trivial FD X → A, X is a superkey.\n\nBCNF is stricter than 3NF. A BCNF decomposition is always *lossless* but may not *preserve dependencies*. A 3NF decomposition can always achieve both.` },
    { id: "db-p5", topicId: "db-txn", title: "ACID and serializability", markdown: `## Transactions\n\n**ACID**: Atomicity, Consistency, Isolation, Durability.\n\nA schedule is **conflict-serializable** if its *precedence graph* is acyclic.\n\n**Two-phase locking (2PL)**: a growing phase, then a shrinking phase. It guarantees conflict serializability but **not** freedom from deadlock. *Strict 2PL* holds exclusive locks until commit, which avoids cascading aborts.\n\nIsolation anomalies: dirty read, non-repeatable read, phantom read.` },
    { id: "db-p6", topicId: "db-idx", title: "Indexes and B+ trees", markdown: `## Indexing\n\n- **Primary (clustered)** index: the file is ordered on the search key. A table can have at most one.\n- **Secondary** index: on a non-ordering field. Always dense.\n- **Dense** index: an entry for every search-key value. **Sparse** index: entries for some values only.\n\n**B+ tree**: balanced. All records are reached through the leaves, and the leaves are linked for range scans. Height is O(log_f n) for fan-out f.\n\nHash indexes are excellent for equality lookups but useless for range queries.` },
  ],
  questions: [
    q("db-q1", "db-er", "A weak entity set is identified by:", ["Its own primary key", "Its partial key plus the owner's primary key", "A foreign key only", "A derived attribute"], 1, "A weak entity has no key of its own. It combines its discriminator with the owner's key."),
    q("db-q2", "db-er", "Age computed from date of birth is a:", ["Composite attribute", "Multi-valued attribute", "Derived attribute", "Key attribute"], 2, "Its value is derived from another stored attribute.", 1),
    q("db-q3", "db-er", "Total participation of an entity set in a relationship means:", ["Every entity participates in at least one relationship instance", "At most one relationship instance per entity", "The relationship is 1:1", "The entity is weak"], 0, "Total participation (double line) means every entity must take part."),
    q("db-q4", "db-ra", "Which relational algebra operator removes duplicate tuples by definition?", ["Select (σ)", "Project (π)", "Cartesian product (×)", "Rename (ρ)"], 1, "Relations are sets, so projection removes duplicates."),
    q("db-q5", "db-ra", "\"Find students who have taken ALL courses\" is naturally expressed with:", ["Union", "Division", "Difference", "Natural join"], 1, "Division expresses 'for all' queries.", 3),
    q("db-q6", "db-ra", "Which is NOT a fundamental relational algebra operator?", ["Select", "Union", "Natural join", "Set difference"], 2, "Join can be derived from product followed by select (and project)."),
    q("db-q7", "db-sql", "Which clause filters groups after aggregation?", ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], 1, "HAVING applies conditions to groups. WHERE filters rows before grouping."),
    q("db-q8", "db-sql", "The correct way to check for missing values is:", ["col = NULL", "col == NULL", "col IS NULL", "ISNULL = col"], 2, "Comparing with = NULL gives unknown. Use IS NULL.", 1),
    q("db-q9", "db-sql", "A LEFT JOIN B returns:", ["Only matching rows", "All rows of A, with NULLs where B has no match", "All rows of B", "The Cartesian product"], 1, "A left outer join keeps every row of the left table."),
    q("db-q10", "db-norm", "A relation is in BCNF if for every non-trivial FD X → A:", ["A is prime", "X is a superkey", "X is a candidate key and A is prime", "A depends on part of a key"], 1, "BCNF requires every determinant to be a superkey."),
    q("db-q11", "db-norm", "2NF removes which kind of dependency?", ["Transitive", "Partial", "Multivalued", "Join"], 1, "2NF forbids non-prime attributes depending on part of a candidate key."),
    q("db-q12", "db-norm", "Which statement is true?", ["Every 3NF relation is in BCNF", "BCNF decomposition always preserves dependencies", "3NF decomposition can be both lossless and dependency-preserving", "1NF allows multi-valued attributes"], 2, "Synthesis into 3NF can always achieve both. BCNF may lose dependencies.", 3),
    q("db-q13", "db-txn", "Two-phase locking guarantees:", ["Freedom from deadlock", "Conflict serializability", "No cascading aborts", "Durability"], 1, "Basic 2PL ensures conflict serializability but can still deadlock."),
    q("db-q14", "db-txn", "A schedule is conflict-serializable if its precedence graph is:", ["Connected", "Acyclic", "Complete", "Bipartite"], 1, "An acyclic precedence graph gives an equivalent serial order."),
    q("db-q15", "db-txn", "The 'I' in ACID stands for:", ["Integrity", "Isolation", "Indexing", "Idempotence"], 1, "Isolation: concurrent transactions behave as if executed serially.", 1),
    q("db-q16", "db-idx", "How many clustered (primary) indexes can a table have?", ["None", "At most one", "One per column", "Unlimited"], 1, "The file can be physically ordered in only one way."),
    q("db-q17", "db-idx", "Hash indexes are a poor choice for:", ["Equality lookups", "Range queries", "Primary keys", "Joins on equality"], 1, "Hashing scatters keys, so ranges can't be scanned in order."),
    q("db-q18", "db-idx", "In a B+ tree, leaf nodes are linked to support:", ["Faster insertion", "Efficient range scans", "Smaller height", "Hashing"], 1, "Linked leaves let a range query walk sequentially."),
  ],
};

export const seedSubjects: Subject[] = [os, dbms];

// ---- Generated history for OS: three quizzes showing improvement --------------------------------

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** skill: probability the student actually knows each topic. Time and answer changes follow from that. */
export function simulate(
  subject: Subject,
  id: string,
  createdAt: string,
  kind: Report["kind"],
  questionIds: string[],
  skill: Record<string, number>,
  seed: number,
): Report {
  const rand = rng(seed);
  const responses = questionIds.map((qid) => {
    const question = subject.questions.find((x) => x.id === qid)!;
    const ideal = idealTimeSec(question);
    const knows = rand() < (skill[question.topicId] ?? 0.5);
    // Someone who doesn't know may still answer fast with a wrong belief (misconception).
    const misconception = !knows && rand() < 0.3;
    const correct = knows || (!misconception && rand() < 0.25);
    const chosen = correct ? question.answer : (question.answer + 1 + Math.floor(rand() * 3)) % 4;
    const ratio = knows || misconception ? 0.5 + rand() * 0.75 : 1.3 + rand() * 1.4;
    const switches = knows || misconception ? (rand() < 0.1 ? 1 : 0) : Math.floor(rand() * 3);
    return scoreResponse(question, chosen, Math.round(ideal * ratio), switches);
  });
  return buildReport({ id, subjectId: subject.id, createdAt, kind, timeLimitSec: questionIds.length * 60, responses });
}

export const seedReports: Report[] = [
  simulate(os, "r-os-1", "2026-11-03T16:20:00.000Z", "diagnostic",
    ["os-q1", "os-q4", "os-q7", "os-q10", "os-q13", "os-q16", "os-q19", "os-q2", "os-q11", "os-q15"],
    { "os-proc": 0.7, "os-sched": 0.55, "os-sync": 0.3, "os-dead": 0.4, "os-mem": 0.35, "os-vm": 0.3, "os-fs": 0.6 }, 2),
  simulate(os, "r-os-2", "2026-11-12T18:05:00.000Z", "practice",
    ["os-q7", "os-q8", "os-q9", "os-q13", "os-q14", "os-q15", "os-q16", "os-q17", "os-q11", "os-q12"],
    { "os-proc": 0.8, "os-sched": 0.65, "os-sync": 0.55, "os-dead": 0.6, "os-mem": 0.5, "os-vm": 0.45, "os-fs": 0.65 }, 30),
  simulate(os, "r-os-3", "2026-11-20T19:40:00.000Z", "practice",
    ["os-q8", "os-q9", "os-q15", "os-q17", "os-q18", "os-q16", "os-q12", "os-q5", "os-q6", "os-q14"],
    { "os-proc": 0.85, "os-sched": 0.7, "os-sync": 0.75, "os-dead": 0.75, "os-mem": 0.7, "os-vm": 0.6, "os-fs": 0.7 }, 8),
];

export const seedStudied: Record<string, string[]> = {
  os: ["os-p1", "os-p2", "os-p3", "os-p4", "os-p5", "os-p6"],
  dbms: ["db-p1"],
};
