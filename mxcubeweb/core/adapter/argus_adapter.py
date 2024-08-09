from mxcubeweb.core.adapter.adapter_base import AdapterBase


class ArgusAdapter(AdapterBase):
    ATTRIBUTES = ["processes_info"]

    def __init__(self, ho, *args):
        super(ArgusAdapter, self).__init__(ho, *args)

    def processes_info(self) -> dict:
        return self.ho.get_processes()
