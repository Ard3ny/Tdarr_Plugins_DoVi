import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { getFileName } from '../../../../FlowHelpers/1.0.0/fileUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Extract DoVi EL',
  description: 'Extract Dolby Vision Enhancement Layer (EL)',
  style: {
    borderColor: 'orange',
  },
  tags: 'video',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue to next plugin',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const pluginWorkDir = `${args.workDir}/dovi_tool`;
  args.deps.fsextra.ensureDirSync(pluginWorkDir);

  // We'll name the EL file something like .el.hevc
  const outputFilePath = `${pluginWorkDir}/${getFileName(args.originalLibraryFile._id)}.el.hevc`;

  // Using `dovi_tool demux` with --el-out:
  const cliArgs: string[] = [
    'demux',
    '-i', `${args.inputFileObj.file}`,
    '--el-out', `${outputFilePath}`,
    '--no-rpu', // omit RPU extraction here; adjust if you want RPU in the same pass
  ];
  const spawnArgs = cliArgs.map((row) => row.trim()).filter((row) => row !== '');

  const cli = new CLI({
    cli: '/usr/local/bin/dovi_tool',
    spawnArgs,
    spawnOpts: {},
    jobLog: args.jobLog,
    outputFilePath,
    inputFileObj: args.inputFileObj,
    logFullCliOutput: args.logFullCliOutput,
    updateWorker: args.updateWorker,
  });

  const res = await cli.runCli();

  if (res.cliExitCode !== 0) {
    args.jobLog('Extracting DoVi EL failed');
    throw new Error('dovi_tool failed');
  }

  args.logOutcome('tSuc');

  return {
    // We typically return the same input file object so the pipeline keeps going.
    // The extracted EL file is stored in pluginWorkDir for next steps.
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};
