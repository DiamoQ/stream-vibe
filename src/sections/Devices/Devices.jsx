
import './Devices.scss'
import Section from "@/layouts/Section";
import Grid from "@/components/Grid";
import devicesItems from "@/sections/Devices/devicesitems";
import DeviceCard from "@/components/DeviceCard";

const Devices = (props) => {

  return (
      <Section
          title='We Provide you streaming experience across various devices.'
          titleId='devices-title'
          description="With StreamVibe, you can enjoy your favorite movies and TV shows anytime, anywhere. Our platform is designed to be compatible with a wide range of devices, ensuring that you never miss a moment of entertainment."
      >
        <Grid
            columns={3}
        >
            {devicesItems.map((card, index) => (
                <DeviceCard
                    {...card}
                    key={index }
                />
            ))}
        </Grid>
      </Section>
  )
}

export default Devices