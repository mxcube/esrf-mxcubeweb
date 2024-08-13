from mxcubeweb.core.adapter.adapter_base import AdapterBase


class ArgusAdapter(AdapterBase):
    ATTRIBUTES = ["processes_info", "last_response"]

    def __init__(self, ho, *args):
        super(ArgusAdapter, self).__init__(ho, *args)
        self.ho.connect("processesChanged", self.processes_changed)
        self.ho.connect("lastResponseChanged", self.last_response_changed)

    def processes_info(self) -> dict:
        return self.ho.get_processes()

    def last_response(self) -> dict:
        return self.ho.get_last_response()

    def processes_changed(self):
        processes = self.ho.get_processes()
        self.emit_ho_attribute_changed("processes_info", processes)

    def last_response_changed(self):
        last_response = self.ho.get_last_response()
        self.emit_ho_attribute_changed("last_response", last_response)
