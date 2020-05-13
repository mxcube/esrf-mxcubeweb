from distutils.core import setup

setup(name="mxcube",
      version="3.2",
      description="Macromolecular Xtallography Customized Beamline Environment",
      author="MXCuBE collaboration",
      license="LGPL-3.0",
      url="https://github.com/mxcube/mxcube3",
      package_dir={"mxcube3": "mxcube3"},
      packages=["mxcube3",
                  "mxcube3.HardwareRepository",
                  "mxcube3.HardwareRepository.HardwareObjects",
                  "mxcube3.HardwareRepository.Command",
                  "mxcube3.HardwareRepository.HardwareObjects.sample_changer",
                  "mxcube3.HardwareRepository.HardwareObjects.detectors",
                  "mxcube3.HardwareRepository.HardwareObjects.Native",
                  "mxcube3.HardwareRepository.HardwareObjects.ESRF",
                  "mxcube3.HardwareRepository.HardwareObjects.SOLEIL",
                  "mxcube3.HardwareRepository.HardwareObjects.EMBL",
                  "mxcube3.HardwareRepository.HardwareObjects.MAXIV",
                  "mxcube3.HardwareRepository.HardwareObjects.ALBA",
                  "mxcube3.video",
                  "mxcube3.routes"],
      package_data={"mxcube3": ['js/*', 'static/*', "video/*js"]},
      scripts=["mxcube3-server"]
      )
