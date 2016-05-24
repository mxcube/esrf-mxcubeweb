const initialState = {
  sampleIds: [],
  taskData: {},
  pointId: -1,
  showForm: '',
  defaultParameters: {
    parameters: {
      num_images: 2,
      transmission: 30,
      exp_time: 0.01,
      osc_start: 0.0,
      osc_range: 0.5,
      resolution: 2.5,
      energy: 12.5,
      kappa: 0,
      kappa_phi: 0,
      strategy_complexity: 1,
      account_rad_damage: true,
      opt_sad: false,
      shutterless: true,
      prefix: 'data',
      run_number: 1,
      path: 'username',
      first_image: 1,
      inverse_beam: false,
      detector_mode: '0'
    }
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SHOW_FORM':
      {
        return {
          ...state,
          showForm: action.name,
          sampleIds: action.sample_ids,
          taskData: action.taskData,
          pointId: action.point_id
        };
      }
    case 'HIDE_FORM':
      {
        return initialState;
      }
    default:
      return state;
  }
};

